let asyncErrorHandler = require('../middleware/asyncErrorHandler')

module.exports = function asyncErrorHook (sails) {
  return {
    initialize (cb) {
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
