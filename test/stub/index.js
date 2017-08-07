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
/*

  // Contribs functions

  deleteContrib (contributionId, username, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }

    let db = this.db
    let connection = this.connection

    let getUser = this.getUser.bind(this)
    let getContribution = this.getContrib.bind(this)

    let tasks = co.wrap(function * () {
      let conn = yield connection
      let userDb = yield getUser(username)

      if (!userDb) {
        return Promise.reject(new Error('user not found'))
      }

      // busca la contribucion
      let contribDb = yield getContribution(contributionId)
      if (!contribDb) {
        return Promise.reject(new Error('contribution not found'))
      }

      // Debe ser el dueño de la contribucion para poder eliminarla
      if (contribDb.user.username !== userDb.username) {
        return Promise.reject(new Error('You are not authorized'))
      }

      // las contribuciones aprobadas no se  pueden eliminar
      if (contribDb.dev.approval) {
        return Promise.reject(new Error('Contributions aprovated can\'t be deleted'))
      }

      let id = contribDb.id

      let response = yield r.db(db).table('contributions').get(id).delete().run(conn)

      if (!response.deleted) {
        return Promise.reject(new Error(`Contribution ${contributionId} not found`))
      }

      let publicId = contribDb.publicId

      let res = {
        code: 200,
        message: 'deleted successfully',
        status: 'ok',
        publicId: publicId
      }

      return Promise.resolve(res)
    })
    return Promise.resolve(tasks()).asCallback(cb)
  }

  rateContrib (contributionId, scoringUsername, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }

    let db = this.db
    let connection = this.connection

    if (!scoringUsername) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    if (!contributionId) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    let getUser = this.getUser.bind(this)
    let getContribution = this.getContrib.bind(this)

    let tasks = co.wrap(function * () {
      let conn = yield connection

      // se necesita saber si el usuario existe
      let userDb = yield getUser(scoringUsername)

      // devuelve un error si no
      if (!userDb) {
        return Promise.reject(new Error('user not found'))
      }

      // Se necesita buscar la contribucion
      let dbContrib = yield getContribution(contributionId)

      // devuelve un error si no existe
      if (!dbContrib) {
        return Promise.reject(new Error('contribution not found'))
      }

      let usersAgree = dbContrib.rate

      // se busca si el usuario ya esta en la lista de rates de la contribucion
      if (usersAgree.includes(userDb.username)) {
        // si esta, lo elimina
        usersAgree = _.remove(usersAgree, (n) => {
          return n !== userDb.username
        })
      } else {
        // si no esta lo agrega
        usersAgree.push(userDb.username)
      }

      // se debe actualizar en la bd
      yield r.db(db).table('contributions').get(dbContrib.id).update({
        rate: usersAgree
      }).run(conn)

      let dbContribActualized = yield getContribution(contributionId)

      // se debe construir la respuesta
      let rate = dbContribActualized.rate.length

      let res = {
        status: 200,
        rate: rate,
        message: 'ok'
      }

      // se da una respuesta
      return Promise.resolve(res)
    })

    return Promise.resolve(tasks()).asCallback(cb)
  }

  editContrib (contributionId, username, changes, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }

    let db = this.db
    let connection = this.connection

    if (!username) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    if (!contributionId) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    // se asegura de que se pueda hacer algun cambio antes de llamar a la bd
    const ChangesProps = ['type', 'info', 'image']
    let count = 0

    for (var prop in changes) {
      if (_.indexOf(ChangesProps, prop) >= 0) count++
    }

    if (count === 0) {
      return Promise.reject(new Error('invalid changes')).asCallback(cb)
    }

    let getUser = this.getUser.bind(this)
    let getContribution = this.getContrib.bind(this)

    let tasks = co.wrap(function * () {
      let conn = yield connection

      // se necesita saber si el usuario existe
      let dbUser = yield getUser(username)

      // devuelve un error si no existe
      if (!dbUser) {
        return Promise.reject(new Error('user not found'))
      }

      // Se necesita buscar la contribucion
      let dbContrib = yield getContribution(contributionId)

      // devuelve un error si no existe
      if (!dbContrib) {
        return Promise.reject(new Error('contribution not found'))
      }

      if (changes.type === '') delete changes.type
      if (changes.info === '') delete changes.info
      if (changes.image === '') delete changes.image

      // se hacen los cambios
      changes.type = changes.type || dbContrib.data.type
      changes.info = changes.info || dbContrib.data.info
      changes.image = changes.image || dbContrib.data.image

      // se debe actualizar en la bd
      yield r.db(db).table('contributions').get(dbContrib.id).update({
        data: changes
      }).run(conn)

      let dbContribActualized = yield getContribution(contributionId)

      let res = {
        status: 200,
        changes: dbContribActualized.data
      }

      // se da una respuesta
      return Promise.resolve(res)
    })

    return Promise.resolve(tasks()).asCallback(cb)
  }

  addContribMessage (contributionId, username, data, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('Not Connected'))
    }

    if (!username) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    if (!contributionId) {
      return Promise.reject(new Error('Invalid contribution ID')).asCallback(cb)
    }

    if (!data || data.length === 0) {
      return Promise.reject(new Error('Invalid message')).asCallback(cb)
    }

    let db = this.db
    let connection = this.connection

    let getUser = this.getUser.bind(this)
    let getContribution = this.getContrib.bind(this)

    let tasks = co.wrap(function * () {
      let conn = yield connection

      // se necesita saber si el usuario existe
      let dbUser = yield getUser(username)

      // devuelve un error si no existe el usuario
      if (!dbUser) {
        return Promise.reject(new Error('user not found'))
      }

      // Se necesita buscar la contribucion
      let dbContrib = yield getContribution(contributionId)

      // devuelve un error si no existe
      if (!dbContrib) {
        return Promise.reject(new Error('contribution not found'))
      }

      /*
        se construye el mensaje, esta es la forma:
        message {
          date: 'date',
          id: 'String',
          message: 'String',
          user: 'String'
        }

      let message = {}
      message.info = data
      message.date = new Date()
      message.id = uuid.v4()
      message.user = {
        username: dbUser.username,
        image: dbUser.avatar,
        admin: dbUser.admin
      }

      yield r.db(db).table('contributions').get(dbContrib.id).update({
        messages: r.row('messages').append(message)
      }).run(conn)

      let dbContribActualized = yield getContribution(contributionId)

      // se crea una respuesta
      let res = _.find(dbContribActualized.messages, {id: message.id})
      res.status = 200
      return Promise.resolve(res)
    })
    return Promise.resolve(tasks()).asCallback(cb)
  }

  delContribMessage (contributionId, username, messageId, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('Not Connected'))
    }

    if (!username) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    if (!contributionId) {
      return Promise.reject(new Error('Invalid contribution ID')).asCallback(cb)
    }

    if (!messageId) {
      return Promise.reject(new Error('Invalid message ID')).asCallback(cb)
    }

    let db = this.db
    let connection = this.connection

    let getUser = this.getUser.bind(this)
    let getContribution = this.getContrib.bind(this)

    let tasks = co.wrap(function * () {
      let conn = yield connection

      // se necesita saber si el usuario existe
      let dbUser = yield getUser(username)

      // devuelve un error si no existe el usuario
      if (!dbUser) {
        return Promise.reject(new Error('user not found'))
      }

      // Se necesita buscar la contribucion
      let dbContrib = yield getContribution(contributionId)

      // devuelve un error si no existe
      if (!dbContrib) {
        return Promise.reject(new Error('contribution not found'))
      }

      // busca el mensaje en la contribucion
      let messageToDel = _.find(dbContrib.messages, function (o) {
        return o.id === messageId
      })

      if (!messageToDel) {
        return Promise.reject(new Error('message ID not found'))
      }

      // revisa si el usuario coincide con el del mensaje
      if (messageToDel.user.username !== username) {
        return Promise.reject(new Error('Unauthorized user'))
      }

      yield r.db(db).table('contributions').get(dbContrib.id).update(function (row) {
        return {
          'messages': row('messages')
          .filter(function (item) {
            return item('id').ne(messageId)
          })
        }
      }).run(conn)

      // se crea una respuesta
      let res = {
        status: 200,
        id: messageId
      }
      return Promise.resolve(res)
    })
    return Promise.resolve(tasks()).asCallback(cb)
  }

  // admin actions

  devRes (contributionId, user, devResponse, cb) {
    if (!this.connected) {
      return Promise.reject(new Error('Not Connected'))
    }

    let db = this.db
    let connection = this.connection

    let getUser = this.getUser.bind(this)
    let getContrib = this.getContrib.bind(this)

    if (!user) {
      return Promise.reject(new Error('Invalid new user')).asCallback(cb)
    }

    let tasks = co.wrap(function * () {
      let conn = yield connection

      // debe reconocer el user
      let username = user.username
      let dbUser = yield getUser(username)

      if (dbUser.error) {
        return Promise.reject(dbUser)
      }

      // debe reconocer si es un user dev
      if (!dbUser.admin) return Promise.reject(new Error('User not authorized'))

      // debe buscar el id de la contribucion
      let dbContrib = yield getContrib(contributionId)

      // si no la encuentra genera un error
      if (dbContrib.error) {
        return Promise.reject(new Error('Contribution not found'))
      }

      // si no se da un campo de aprovacion, entonces es falsa por defecto
      devResponse.approval = devResponse.approval ? devResponse.approval = true : devResponse.approval = false

      // si la encuentra debe asignarle la respuesta del dev
      yield r.db(db).table('contributions').get(dbContrib.id).update({
        dev: devResponse
      }).run(conn)

      let dbContribActualized = yield getContrib(contributionId)

      // Se debe crear la respuesta a la contribucion
      let res = {
        status: 200,
        message: dbContribActualized.dev.message,
        approval: dbContribActualized.dev.approval
      }

      // devuelve un res
      return Promise.resolve(res)
    })

    return Promise.resolve(tasks()).asCallback(cb)
  }
  */
}
