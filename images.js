'use strict'

import { send, json } from 'micro' // eslint-disable-line no-unused-vars
import httpHash from 'http-hash'
import Db from 'automata-db'
import DbStub from './test/stub'
import config from './config'
import utils from './lib/utils'

let dev = process.env.NODE_ENV || 'production'
let db = new Db(config.db)

if (dev === 'test') {
  db = new DbStub()
}

const hash = httpHash()

// add award to image
hash.set('POST /award/:imageId', async function addAwardToPicture (req, res, params) {
  let award = await json(req)
  let imageId = params.imageId

  // el token va firmado por el sponsor
  // award
  // {
  //    type: 'tipo de award',
  //    sponsor: 'Quien dio el award'
  // }

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== award.sponsor) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let created = await db.addPictureAward(imageId, award)
  await db.disconnect()

  send(res, 201, created)
})

// get images by username
hash.set('GET /byuser/:username', async function getImagesByUSer (req, res, params) {
  let username = params.username
  await db.connect()
  let images = await db.getPicturesByUser(username)
  await db.disconnect()
  send(res, 200, images)
})

// Get one image by id
hash.set('GET /:imageId', async function getOneImage (req, res, params) {
  let imageId = params.imageId
  await db.connect()
  let image = await db.getPicture(imageId)
  await db.disconnect()

  send(res, 200, image)
})

// Get all images
hash.set('GET /', async function getAllImages (req, res, params) {
  await db.connect()
  let images = await db.getAllPictures()
  await db.disconnect()

  send(res, 200, images)
})

// Create image
hash.set('POST /', async function createImage (req, res, params) {
  let image = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== image.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let created = await db.createPicture(image)
  await db.disconnect()

  send(res, 201, created)
})

// Delete Image
hash.set('DELETE /', async function deleteImage (req, res, params) {
  let image = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== image.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let response = await db.deletePicture(image.publicId)
  await db.disconnect()

  send(res, 201, response)
})

export default async function (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, {error: e.message})
    }
  } else {
    send(res, 404, { error: 'route not found' })
  }
}
