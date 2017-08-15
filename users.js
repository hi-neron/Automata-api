'use strict'

import { send, json } from 'micro'
import httpHash from 'http-hash'
import Db from 'automata-db'
import DbStub from './test/stub'
import config from './config'
import utils from './lib/utils'

const env = process.env.NODE_ENV || 'production'
let db = new Db(config.db)

if (env === 'test') {
  db = new DbStub()
}

const hash = httpHash()

hash.set('GET /mastery/:mastery', async function getUsersByMastery (req, res, params) {
  let mastery = params.mastery
  await db.connect()
  let usersDb = await db.getUsersByMastery(mastery)
  await db.disconnect()

  usersDb = usersDb.map((object) => {
    delete object.password
    delete object.email
    return object
  })

  send(res, 201, usersDb)
})

hash.set('POST /:username/mastery', async function editMasteries (req, res, params) {
  let username = params.username
  let data = await json(req)
  let masteries = data.masteries

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== data.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  await db.connect()
  let userDb = await db.editMasteries(username, masteries)
  await db.disconnect()

  delete userDb.password
  delete userDb.email

  send(res, 201, userDb)
})

hash.set('POST /:username/avatar', async function addAvatar (req, res, params) {
  let username = params.username
  let data = await json(req)
  let avatar = data.avatar

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== data.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }

  if (utils.imageVerify(avatar)) {
    await db.connect()
    let result = await db.addAvatar(username, avatar)
    await db.disconnect()

    delete result.password
    delete result.email

    send(res, 201, result)
  } else {
    send(res, 401, {error: 'invalid image'})
  }
})

hash.set('GET /:username', async function getUser (req, res, params) {
  let username = params.username
  await db.connect()
  let userDb = await db.getUser(username)
  await db.disconnect()

  if (userDb.error) {
    send(res, 401, userDb.error)
  }

  delete userDb.email
  delete userDb.password

  send(res, 201, userDb)
})

hash.set('POST /', async function createUser (req, res, params) {
  let user = await json(req)
    console.log(user)

  if (!user.facebook && !user.password) {
    send(res, 500, {error: 'user need password'})
  }

  if (!user.username) {
    send(res, 500, {error: 'user need username'})
  }

  let passed, created

  await db.connect()
  try {
    await db.getUser(user.username)
    passed = false

    if (env === 'test') {
      throw new Error('testing forced error')
    }
  } catch (e) {
    created = await db.createUser(user)
    passed = true
  }
  await db.disconnect()

  if (passed) {
    delete created.email
    delete created.password
    send(res, 201, created)
  } else {
    send(res, 404, { error: 'User already exists' })
  }
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
