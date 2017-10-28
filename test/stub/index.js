'use strict'
import fixtures from '../fixtures/'

export default class Database {
  connect () {
    return Promise.resolve(true)
  }

  disconnect () {
    return Promise.resolve(true)
  }

  createUser (user) {
    return Promise.resolve(fixtures.getUser())
  }

  getUser (username) {
    return Promise.resolve(fixtures.getUser())
  }

  editMasteries (username, masteries) {
    let user = fixtures.getUser()
    masteries = masteries.map((item) => {
      return item.toLowerCase()
    })
    user.masteries = masteries
    return Promise.resolve(user)
  }

  getUsersByMastery (mastery) {
    return Promise.resolve([1, 2, 3, 4])
  }

  addAvatar (username, avatar) {
    let user = fixtures.getUser()
    user.avatar = avatar
    return Promise.resolve(user)
  }

  addMessage (username, message) {
  }

  addAlert (username, alert) {
  }

  getCommunications (username) {
  }

  addPoints (username, points) {
  }

  addBadge (username, badge) {
  }

  addSkill (username, skill) {
  }

  createPicture (image) {
    return Promise.resolve(image)
  }

  getPicture (imageId) {
    return Promise.resolve(fixtures.getImage())
  }

  getAllPictures () {
    return Promise.resolve(fixtures.getImages())
  }

  deletePicture (imageId) {
    let res = {
      code: 204,
      message: `image ${imageId} successful deleted`,
      status: 'ok'
    }

    return Promise.resolve(res)
  }

  addPictureAward (imageId, award) {
  }

  getPicturesByUser (username) {
    return Promise.resolve(fixtures.getImages())
  }

  authenticate (username, password) {
    return Promise.resolve(true)
  }

  // last: contributions
  // obtiene una contribucion
  getContrib (contributionId) {
    return Promise.resolve(fixtures.getContrib())
  }
  // obtiene todas las contribuciones
  getTenContribs (lastT) {
    let contributions = [
      fixtures.getContrib(),
      fixtures.getContrib(),
      fixtures.getContrib()
    ]

    let res = {
      status: 200,
      contributions: contributions
    }
    return Promise.resolve(res)
  }

  createContrib (contribution, username) {
    let contrib = fixtures.getContrib()
    contrib.data = contribution
    return Promise.resolve(contrib)
  }

  deleteContrib (contributionId, username, cb) {
    let res = {
      message: 'deleted successfully',
      status: 200,
      publicId: contributionId
    }
    return Promise.resolve(res)
  }

  rateContrib (contributionId, scoringUsername, cb) {
    let rate = ['pepe']
    let res = {
      status: 200,
      rate: rate,
      message: 'ok'
    }
    return Promise.resolve(res)
  }

  editContrib (contributionId, username, changes, cb) {
    let res = {
      status: 200,
      changes: changes
    }

    // se da una respuesta
    return Promise.resolve(res)
  }

  devRes (contributionId, user, devResponse, cb) {
    let res = {
      status: 200,
      message: devResponse.message,
      approval: devResponse.approval
    }
    return Promise.resolve(res)
  }

  addContribMessage (contributionId, user, content, cb) {
    let message = {}

    message.content = content
    message.date = new Date()
    message.id = 'efhionerfn23oefn'
    message.contribId = contributionId
    message.user = {
      username: user,
      publicId: 12341241,
      image: 'fefrg.png',
      admin: false
    }

    let res = {
      status: 200,
      message: message
    }

    return Promise.resolve(res)
  }

  delContribMessage (contributionId, user, messageId) {
    let res = {
      status: 200,
      message: 'hi hi'
    }

    return Promise.resolve(res)
  }

  setManOfMonth (useradmin, usermom) {
    let response = {
      status: 200,
      mom: fixtures.getMom()
    }
    return Promise.resolve(response)
  }

  getManOfMonth () {
    let response = {
      status: 200,
      mom: fixtures.getMom()
    }
    return Promise.resolve(response)
  }

  getContribsByTag (tag) {
    let response = {
      status: 200,
      contribs: fixtures.getContrib
    }
    return Promise.resolve(response)
  }

  /*

  */
}
