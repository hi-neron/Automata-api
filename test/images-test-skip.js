'use strict'
import config from '../config'
import fixtures from './fixtures'
import images from '../images'
import listen from 'test-listen'
import micro from 'micro'
import request from 'request-promise'
import test from 'ava'
import utils from '../lib/utils'

test.beforeEach(async t => {
  let srv = micro(images)
  t.context.url = await listen(srv)
})

test('POST / create an image', async t => {
  let url = t.context.url
  let image = fixtures.getImage()

  let token = await utils.signToken({ userId: image.userId }, config.secret)

  let options = {
    method: 'POST',
    url: `${url}/`,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let newImage = await request(options)
  console.log(newImage.body)
  t.is(newImage.body.description, image.description)
  t.is(newImage.body.userId, image.userId)
})

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

test('GET /:image one image', async t => {
  let url = t.context.url
  let image = fixtures.getImage()

  let options = {
    method: 'GET',
    url: `${url}/${image.imageId}`,
    json: true,
    resolveWithFullResponse: true
  }

  let imageDb = await request(options)
  t.deepEqual(imageDb.body.publicId, image.publicId)
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

// GetByUser
// AddAward
