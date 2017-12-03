module.exports = function asyncErrorHandler (action, controller) {
  sails.log.error('Initialized asyncErrorHandler (HTTP Middleware).\n\tController (' +
                  controller + ') errors are being handled.')

  return async function (req, res, next) {
    let caller = `${req.method} @ ${req.url} invoking ${controller}`

    if (typeof action !== 'function') res.serverError('Wrapper expected action to be a function.')
    sails.log.silly('Handling HTTP request: ' + caller);

    try {
      await action(req, res, next)
    } catch (err) {
      sails.log.error(`Encountered error ${err.code}.`)
      return sails.helpers.errorHandling({caller, err, res}).execSync()
    }
  }
}
