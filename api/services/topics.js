'use strict'

const topics = require('../mocks/topics');

module.exports = function (fastify, opts, next) {
  fastify.get('/clusters/:clusterId/topics', function (request, reply) {
    reply.send(topics[request.params.clusterId]);
  });

  next();
}
