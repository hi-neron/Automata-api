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

/*
test('GET / all images', async t => {
  let url = t.context.url
  let images = fixtures.getImages()

  let options = {
    method: 'GET',
    url: url,
    json: true,
    resolveWithFullResponse: true
  }

  let imagesDb = await request(options)
  t.deepEqual(imagesDb.body.length, images.length)
})

test('DELETE /:image delete one image', async t => {
  let url = t.context.url
  let image = fixtures.getImage()
  let user = fixtures.getUser()

  image.userId = user.publicId

  let token = await utils.signToken({ userId: user.publicId }, config.secret)

  let options = {
    method: 'DELETE',
    url: `${url}/`,
    json: true,
    body: {
      userId: user.publicId,
      imageId: image.publicId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.is(response.body.status, 'ok')
  t.is(response.body.code, 204)
})

test('GET /:username/images', async t => {
  let url = t.context.url
  let images = fixtures.getImages()

  let options = {
    method: 'GET',
    url: `${url}/images/${images[0].username}`,
    json: true,
    resolveWithFullResponse: true
  }

  let imagesUserDb = await request(options)
  console.log(imagesUserDb.body)
  t.deepEqual(imagesUserDb.body[0].username, images[0].username)
})

*/

test.todo('POST create a contrib')
test.todo('DELETE a contrib')
test.todo('POST rate a contrib')
test.todo('POST edit a contrib')
test.todo('POST add message to contrib')
test.todo('POST delete message contrib')
test.todo('POST add dev response contrib')
