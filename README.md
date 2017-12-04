# Error Handling Hook

A simple sails.js v1 hook designed to help centeralize application error
handling within controllers when working with async calls.

Can be used to any capacity. Only unhandled exceptions are intercepted.

## Features

+ New '/api/errors' directory to house custom exceptions to be handled
+ New sails.errors['YourCustomException'] dictionary
  - Follows conventions of 'throw new <Exception>'
+ Single source of truth for error handling under '/api/helpers/error-handler.js'
+ Plug and play. No need to modify existing code to start using. Simply pop the
  hook into your '/api/hooks' directory and any unhandled exceptions within
  your controllers will be rerouted to the handy error-handler.

## How it works

Rather than wrapping ORM or async calls in try...catch blocks within your
controllers (verbose) we instead  wrap the controllers in an error handling
promise that resolves with a single try...catch. Caught errors are passed off
to the error-handler helper where a single switch defines how to handle the
specific error (response type, message).

## Error format

`{
        name: 'SampleException',
        code: 'E_SAMPLE_EXCEPTION',
        details: 'User friendly information.' 
}`

Name - The sails.errors key

Code - Switch value, used to avoid clobber

Details - By default, the message returned within the response

Default response is a res.badRequest response. Can be customized per exception
under the helper error-handler.

## Nitty Gritty

On the 'router:before' event we iterate through the sails._actions object and
wrap the controller actions with our middleware wrapper. The wrapper takes the
action and controller name as arguments and returns a promise. When called, the
wrapper resolves the promise and catches any unhandled exceptions where it then
passes off control to the sails helper error-handler.js. There is no
requirement to use error-handler. You can define your own solution if needed,
but I found this a convenient way to centeralize my error handling.


## Purpose

I wanted to cut down on the clutter within my controller and model actions. I
decided the best option was a centeralized error handler but I wanted to avoid
introducing bloat. By wrapping actions after they are loaded by the sails
router we can introduce functionality while maintaining the expected controller
signature. This solution has very little overhead and allows for a single
source of error handling/error logging with a uniform format.

Controllers are 60% more streamlined! (Not really, but they are much cleaner).

