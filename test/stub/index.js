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
}

// export default class Db {
//   connect () {
//     return Promise.resolve(true)
//   }

//   disconnect () {
//     return Promise.resolve(true)
//   }

//   getImage () {
//     return Promise.resolve(fixtures.getImage())
//   }

//   saveImage (image) {
//     return Promise.resolve(fixtures.getImage())
//   }

//   likeImage (idImage) {
//     let image = fixtures.getImage()
//     image.liked = true
//     image.likes = 1
//     return Promise.resolve(image)
//   }

//   getImages () {
//     let images = fixtures.getImages()
//     return Promise.resolve(images)
//   }

//   getImagesByTag (tag) {
//     let images = fixtures.getImagesTagged()
//     return Promise.resolve(images)
//   }

//   createUser (user) {
//     return Promise.resolve(fixtures.getUser())
//   }

//   getUser (username) {
//     return Promise.resolve(fixtures.getUser())
//   }

//   authenticate () {
//     return Promise.resolve(true)
//   }
// }
