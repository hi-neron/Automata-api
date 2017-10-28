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

  let token = await utils.signToken({ userId: contrib.user.username }, config.secret)

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

  let token = await utils.signToken({ userId: contrib.user.username }, config.secret)

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

  let token = await utils.signToken({ userId: username }, config.secret)

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

  let token = await utils.signToken({ userId: username }, config.secret)

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

test('POST add dev response contrib', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  // los identificadores de la bd
  let username = contrib.user.username
  let contribId = contrib.publicId

  let token = await utils.signToken({ userId: username }, config.secret)

  let devResponse = {
    message: 'Esto puede funcionar',
    approval: true
  }

  let data = {
    contribId: contribId,
    username: username,
    devRes: devResponse
  }

  let options = {
    method: 'POST',
    url: `${url}/devres`,
    json: true,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 200, 'status should be 200')
  t.is(response.body.message, devResponse.message, 'should be the same message')
  t.is(response.body.approval, devResponse.approval, 'should be the same response')
})

// Man Of Month
// url /setmom
test.skip('POST set mom', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()
  let mom = fixtures.getMom()

  // los identificadores de la bd
  let username = contrib.user.username

  let token = await utils.signToken({ userId: username }, config.secret)

  let data = {
    username: username
  }

  let options = {
    method: 'POST',
    url: `${url}/setmom/pedro`,
    json: true,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 200, 'status should be 200')
  t.deepEqual(response.body.mom, mom, 'should be the same mom')
})

// url /getmom
test.skip('GET get mom', async t => {
  let url = t.context.url
  let mom = fixtures.getMom()

  let options = {
    method: 'GET',
    url: `${url}/getmom`,
    json: true,
    resolveWithFullResponse: true
  }

  let response = await request(options)
  console.log(response.body)
  t.is(response.body.status, 200, 'status should be 200')
  t.deepEqual(response.body.mom, mom, 'should be the same mom')
})

// url /getbytag
test.skip('GET get contribs by tag ', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  let tag = contrib.tags[0]

  let options = {
    method: 'GET',
    url: `${url}/getbytag/${tag}`,
    json: true,
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 200, 'status should be 200')
  t.deepEqual(response.body.tags[0], tag, 'should be the same mom')
})

// next tests will make with a realtime module
test.skip('POST add message to contrib', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  // los identificadores de la bd
  let username = contrib.user.username
  let contribId = contrib.publicId

  let token = await utils.signToken({ userId: username }, config.secret)

  let content = 'hola este es mi mensaje'

  let data = {
    contribId: contribId,
    username: username,
    content: content
  }

  let options = {
    method: 'POST',
    url: `${url}/addmessage`,
    json: true,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 200, 'status should be 200')
  t.is(response.body.message.content, data.message, 'should be the same message')
  t.is(response.body.message.user.username, data.username, 'should be the same response')
  t.is(response.body.message.id, data.contribId, 'should be the same response')
})

// delete messages
test.skip('POST delete message contrib', async t => {
  let url = t.context.url
  let contrib = fixtures.getContrib()

  // los identificadores de la bd
  let username = contrib.user.username
  let contribId = contrib.publicId

  let token = await utils.signToken({ userId: username }, config.secret)
  let messageId = '123245'

  let data = {
    contribId: contribId,
    username: username,
    messageId: messageId
  }

  let options = {
    method: 'POST',
    url: `${url}/delmessage`,
    json: true,
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 200, 'status should be 200')
  t.is(response.body.message.content, data.message, 'should be the same message')
  t.is(response.body.message.user.username, data.username, 'should be the same response')
  t.is(response.body.message.id, data.contribId, 'should be the same response')
})
