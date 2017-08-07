'use strict'

import config from '../config'
import fixtures from './fixtures'
import listen from 'test-listen'
import micro from 'micro'
import request from 'request-promise'
import test from 'ava'
import users from '../users'
import utils from '../lib/utils'

test.beforeEach(async t => {
  let srv = micro(users)
  t.context.url = await listen(srv)
})

test('POST / create user', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'POST',
    url: url,
    json: true,
    body: {
      user: user.name,
      username: user.username,
      password: user.password,
      email: user.email
    },
    resolveWithFullResponse: true
  }

  delete user.email
  delete user.password

  let userDb = await request(options)

  t.deepEqual(userDb.body, user)
})

test('GET /:username', async t => {
  let url = t.context.url
  let user = fixtures.getUser()

  let options = {
    method: 'GET',
    url: `${url}/${user.username}`,
    json: true
  }

  delete user.email
  delete user.password

  let userDb = await request(options)
  t.deepEqual(userDb, user)
})

test('GET /mastery/:mastery getUsersByMastery', async t => {
  let url = t.context.url
  let mastery = 'Photography'

  let options = {
    method: 'GET',
    url: `${url}/mastery/${mastery}`,
    json: true
  }

  let users = await request(options)
  t.is(users.length, 4)
})

test('POST /:username/mastery editMastery', async t => {
  let url = t.context.url
  let user = fixtures.getUser()
  let masteries = ['Photography', 'Brand']

  let token = await utils.signToken({ userId: user.publicId }, config.secret)

  let options = {
    method: 'POST',
    url: `${url}/${user.username}/mastery`,
    json: true,
    body: {
      masteries: masteries,
      userId: user.publicId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  masteries = masteries.map((item) => {
    return item.toLowerCase()
  })

  let response = await request(options)
  t.deepEqual(response.body.masteries, masteries)
})

test('POST /:username/avatar addAvatar', async t => {
  let url = t.context.url
  let avatar = 'avatar.gif'
  let user = fixtures.getUser()

  let token = await utils.signToken({ userId: user.publicId }, config.secret)

  let options = {
    method: 'POST',
    url: `${url}/${user.username}/avatar`,
    json: true,
    body: {
      avatar: avatar,
      userId: user.publicId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  t.deepEqual(response.body.avatar, avatar)
  options.body.avatar = 'pepwef*d_fe.wdf'
  t.throws(request(options), /invalid/)
})

/*
AddSkill
GetSkills
AddPoint
GetPoints
AddMessage
GetMessages
AddAlert
GetAlerts
GetBadges
AddBadge
*/
