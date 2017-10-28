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

// MAN OF MONTH

// set mom
hash.set('POST /setmom/:username', async function setManOfMonth (req, res, params) {
  let data = await json(req)
  let username = data.username
  let usermom = params.username

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let created = await db.setManOfMonth(username, usermom)
  await db.disconnect()

  send(res, 201, created)
})

// get mom
hash.set('GET /getmom', async function getManOfMonth (req, res, params) {
  await db.connect()
  let mom = await db.getManOfMonth()
  await db.disconnect()

  send(res, 201, mom)
})

// edit a contrib
hash.set('POST /edit', async function editContrib (req, res, params) {
  let data = await json(req)
  let contribId = data.contribId
  let username = data.username
  let changes = data.info

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let created = await db.editContrib(contribId, username, changes)
  await db.disconnect()

  send(res, 201, created)
})

// rate a contrib
hash.set('POST /rate', async function rateContrib (req, res, params) {
  let data = await json(req)
  let contribId = data.contribId
  let username = data.username

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: e})
  }

  await db.connect()
  let created = await db.rateContrib(contribId, username)
  await db.disconnect()

  send(res, 201, created)
})

// add devResponse
hash.set('POST /devres', async function devResponse (req, res, params) {
  let data = await json(req)
  let contribId = data.contribId
  let username = data.username
  let devRes = data.devRes

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let resAdded = await db.devRes(contribId, username, devRes)
  await db.disconnect()
  console.log(resAdded)

  send(res, 201, resAdded)
})

// delete new contrib message
hash.set('POST /delmessage', async function deleteContribMessage (req, res, params) {
  let contrib = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== contrib.username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  let contribId = contrib.contribId
  let username = contrib.username
  let messageId = contrib.messageId

  await db.connect()
  let delMessage = await db.delContribMessage(contribId, username, messageId)
  await db.disconnect()

  send(res, 201, delMessage)
})

// add new contrib message
hash.set('POST /addmessage', async function addContribMessage (req, res, params) {
  let contrib = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== contrib.username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  let contribId = contrib.contribId
  let username = contrib.username
  let content = contrib.content

  await db.connect()
  let newMessage = await db.addContribMessage(contribId, username, content)
  await db.disconnect()

  send(res, 201, newMessage)
})

// obtener las ultimas contribuciones
hash.set('GET /last/:group', async function getTenContribs (req, res, params) {
  let group = params.group
  await db.connect()
  let contribs = await db.getTenContribs(group)
  await db.disconnect()
  console.log(contribs.contributions[0])
  send(res, 200, contribs)
})

// obtener contribuciones por tag
hash.set('GET /getbytag/:tag', async function getOneContrib (req, res, params) {
  let tag = params.tag
  console.log(tag)
  await db.connect()
  let contribs = await db.getContribsByTag(tag)
  await db.disconnect()
  send(res, 200, contribs)
})

// obtener una contribucion
hash.set('GET /:id', async function getOneContrib (req, res, params) {
  let id = params.id
  await db.connect()
  let contrib = await db.getContrib(id)
  await db.disconnect()
  send(res, 200, contrib)
})

// crea una contribuciuon
hash.set('POST /', async function createContrib (req, res, params) {
  let contrib = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== contrib.username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  let username = contrib.username
  delete contrib.username

  await db.connect()
  let created = await db.createContrib(contrib, username)
  await db.disconnect()

  send(res, 201, created)
})

// elimina una contribucion
hash.set('DELETE /', async function deleteContrib (req, res, params) {
  let body = await json(req)
  let contribId = body.contribId
  let username = body.username

  // revisa si el token concuerda
  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== username) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let response = await db.deleteContrib(contribId, username)
  await db.disconnect()

  send(res, 201, response)
})

// delete contrib message

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
