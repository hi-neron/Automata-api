'use strict'

import { send, json } from 'micro'
import HttpHash from 'http-hash'
import Db from 'automata-db'
import config from './config'
import Dbstub from './test/stub'
import utils from './lib/utils'

const env = process.env.NODE_ENV || 'production'

let db = new Db(config.db)
if (env === 'test') {
  db = new Dbstub()
}

const hash = HttpHash()

hash.set('POST /', async function authenticate (req, res, params) {
  let keys = await json(req)
  await db.connect()
  let auth = await db.authenticate(keys.username, keys.password)
  await db.disconnect()

  if (!auth) {
    return send(res, 401, {'error': 'User or password invalid'})
  }

  let token = await utils.signToken({
    userId: keys.username
  }, config.secret)

  send(res, 200, token)
})

export default async function main (req, res) {
  let { method, url } = req

  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    try {
      await match.handler(req, res, match)
    } catch (e) {
      send(res, 500, {error: e.message})
    }
  } else {
    send(res, 404, {error: 'route not found'})
  }
}
