'use strict'

module.exports = function (fastify, opts, next) {
  fastify.get('/brokers', function (request, reply) {
    reply.send([

    ]);
  });

  next();
}
