'use strict'

const path = require('path');
const AutoLoad = require('fastify-autoload');
const CORS = require('fastify-cors');

module.exports = function (fastify, opts, next) {
  fastify.register(CORS, {
    origin: 'http://localhost:3000',
    preflight: true,
    preflightContinue: true,
    credentials: true,
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  })

  // Make sure to call next when done
  next()
}
