'use strict'

import test from 'ava'
import micro from 'micro'
import auth from '../auth'
import listen from 'test-listen'
import request from 'request-promise'
import fixtures from './fixtures'

test.beforeEach(async t => {
  let srv = micro(auth)
  t.context.url = await listen(srv)
})

test('POST / authenticate', async t => {
  let url = t.context.url
  let user = fixtures.getUser()

  let options = {
    url: url,
    method: 'POST',
    json: true,
    body: {
      username: user.username,
      password: user.password
    },
    resolveWithFullResponse: true
  }

  let token = await request(options)
  t.truthy(token.body)
})
