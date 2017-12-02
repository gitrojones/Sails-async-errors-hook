module.exports = {
  friendlyName: 'ORM Error Handling',
  description: 'Handles the Sails ORM error codes gracefully.',
  sync: true,

  inputs: {
    caller: {
      type: 'string',
      description: 'Calling controller name.',
      required: true
    },
    err: {
      type: 'ref',
      description: 'The caught error to be handled.',
      required: true
    },
    res: {
      type: 'ref',
      description: 'The response method from the controller.',
      required: true
    }
  },
  fn ({err, res, caller}, {success}) {
    let msg = `[${caller}] ${err.name}: ${err.details}`
    let message

    switch (err.code) {
      case 'E_INVALID_VALUES_TO_SET':
      case 'E_INVALID_NEW_RECORD':
        message = 'Invalid or Missing value for a required attribute.'
        break
      case 'E_ATTR_NOT_REGISTERED':
      case 'E_INVALID_PK_VALUE':
        message = 'Uh oh. Something went wrong! Logged for review.'
        break
      default:
        message = err
        break
    }

    sails.log.error(msg, message)
    return success(res.badRequest(message))
  }
}
