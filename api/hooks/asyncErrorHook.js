let fs = require('fs')
let util = require('util')

let asyncErrorHandler = require('../middleware/asyncErrorHandler')

module.exports = function asyncErrorHook (sails) {
  return {
    async initialize (cb) {
      // Gather and 'register' all errors within /api/errors
      sails.errors = await hoistedErrorDirectory()

      sails.on('router:before', function () {
        let routes = sails.router.explicitRoutes

        for (let key in routes) {
          let controller = routes[key].replace('.', '/').replace('Controller', '').toLowerCase()
          let action = sails._actions[controller]

          if (typeof action !== 'function') continue

          let middleware = action['_middlewareType']
          sails._actions[controller] = asyncErrorHandler(action, controller)
          sails._actions[controller]['_middlewareType'] = middleware
        }

      })

      return cb()
    }
  }
}

async function hoistedErrorDirectory() {
  let errorDir = sails.config.appPath + '/api/errors'
  let errorFileNames

  try {
    errorFileNames = await new Promise((resolve, reject) => fs.readdir(errorDir, (err, files) => {
      if (err) reject(err)
      return resolve(files)
    }))
  } catch (err) {
    sails.log.error('Failed to gather files from /api/errors. Details\n\n' + err)
  }

  if (_.isArray(errorFileNames)) {
    // We have files to process
    sails.log.silly('Hoisting the following files:', errorFileNames)
    let errors = {}
    let errorFiles = errorFileNames.reduce((promises, file) => {
      if (!file.match(/.+Exception\.js/)) return
      let filePath = errorDir + '/' + file

      promises.push(new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) reject(err)
          resolve(eval(data))
        })
      }))

      return promises
    }, [])

    _.forEach(await Promise.all(errorFiles), (data) => {
      if (_.has(data, 'name')) {
        errors[data.name] = ErrorWrapper(data)
        sails.log.silly('Successfully loaded custom error', data.name)
      } else sails.log.error('Expected exception to define "name". Skipping', data)
    })

    sails.log.silly('Registered the following custom exceptions:', errors)
    return errors
  } else sails.log.error('No errors to hoist. Ensure the /api/errors directory exists.',
    'See documentation for more details.')
}

function ErrorWrapper({name, code, details}) {
  // Basically our errors define common details and we extend Error with the new details.
  let CustomError = function () {
    Error.captureStackTrace(this, CustomError);
    this.name = name;
    this.code = code;
    this.details = details;
  }

  util.inherits(CustomError, Error)

  return CustomError
}
