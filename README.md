# Error Handling Hook
## Purpose

I didn't like how using async functions within my controllers resulted in
having to wrap many of my calls in try...catch blocks, bloating my code
considerably. Further, with my various error handling features spread across
each controller maintainability was a concern for me. I decided to centeralize
my error handling into a single handy helper and hook combination that gives
portability to my solution without having any noticable overhead over the
traditional method of try...catch. The added benefit is that the centeralized
error handling lends itself well to logging events with a single uniform
format.

## Features

 + Centeralized Error handling
 + Centeralized Error logging
 + Near-Zero overhead
 + Portable and appropriate for all project types
 + Less controller bloat 

## How it works

Basic enough, the hook initializes with sails and waits for the router:before
event where it then iterates through the sails._actions object and wraps each
action function with my middleware function asyncErrorHandler. The handler
takes the action and controller name as arguments and returns a promise which
awaits the resolution of the action with a try...catch to catch all unhandled
errors (which we intentionally leave unhandled). From there, the middleware
calls the sails.helpers.errorHandler helper method which is solely responsible
for handling errors using a switch statement for the error code.
