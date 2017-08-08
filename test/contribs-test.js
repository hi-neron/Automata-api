'use strict'
import config from '../config'
import fixtures from './fixtures'
import contributions from '../contributions'
import listen from 'test-listen'
import micro from 'micro'
import request from 'request-promise'
import test from 'ava'
import utils from '../lib/utils'

test.beforeEach(async t => {
  let srv = micro(contributions)
  t.context.url = await listen(srv)
})

// url: /:publicId
test('GET one contrib', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  // la publicid se decodifica en la bd
  let options = {
    method: 'GET',
    url: `${url}/${contrib.publicId}`,
    json: true,
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.deepEqual(response.body.id, contrib.id)
})

// url: /
test('GET contribs', async t => {
  let url = t.context.url

  // la publicid se decodifica en la bd
  let options = {
    method: 'GET',
    url: `${url}/last/${0}`,
    json: true,
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.contributions.length, 3, 'size 3')
})

// url: /
test('POST / create a contrib', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  let token = await utils.signToken({ username: contrib.user.username }, config.secret)

  let toSend = contrib.data
  toSend.username = contrib.user.username

  let options = {
    method: 'POST',
    url: `${url}/`,
    json: true,
    body: toSend,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  delete toSend.username
  t.deepEqual(response.body.data, contrib.data)
  t.is(response.body.user.username, contrib.user.username)
})

// url: /
test('DELETE delete a contrib', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  let token = await utils.signToken({ username: contrib.user.username }, config.secret)

  let contribId = contrib.publicId

  let options = {
    method: 'DELETE',
    url: `${url}`,
    json: true,
    body: {
      username: contrib.user.username,
      contribId: contribId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.deepEqual(response.body.publicId, contribId)
  t.is(response.body.status, 200, 'status must be 200')
})

// url: /rate
test('POST /rate rate a contrib', async t => {
  /*
    {
      contribId,
      username
    }
  */

  let url = t.context.url
  let contrib = fixtures.getContrib()
  let username = contrib.user.username
  let contribId = contrib.publicId

  let token = await utils.signToken({ username: username }, config.secret)

  let data = {
    contribId: contribId,
    username: username
  }

  let options = {
    method: 'POST',
    url: `${url}/rate`,
    json: true,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.rate.length, 1)
})

// url: /rate
test('POST /edit edit a contrib', async t => {
  /*
    {
      type,
      info,
      image
    }
  */

  let url = t.context.url
  let contrib = fixtures.getContrib()

  // los identificadores de la bd
  let username = contrib.user.username
  let contribId = contrib.publicId

  let token = await utils.signToken({ username: username }, config.secret)

  let info = {
    type: 'Photo',
    info: 'This is the contrib messaje',
    image: 'pgot.png'
  }

  let data = {
    contribId: contribId,
    username: username,
    info: info
  }

  let options = {
    method: 'POST',
    url: `${url}/edit`,
    json: true,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 200, 'status should be 200')
  t.deepEqual(response.body.changes, info, 'status should be 200')
})

// next tests will make with a realtime module
test.todo('POST add dev response contrib')
test.todo('POST add message to contrib')
test.todo('POST delete message contrib')
