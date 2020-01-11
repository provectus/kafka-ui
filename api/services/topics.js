'use strict'

const topics = require('../mocks/topics');
const topicDetails = require('../mocks/topicDetails');
const topicConfig = require('../mocks/topicConfig');

module.exports = function (fastify, opts, next) {
  fastify
    .get('/clusters/:clusterId/topics', function (request, reply) {
      reply.send(topics[request.params.clusterId]);
    })
    .get('/clusters/:clusterId/topics/:topicId', function (request, reply) {
      reply.send(topicDetails);
    })
    .get('/clusters/:clusterId/topics/:topicId/config', function (request, reply) {
      reply.send(topicConfig);
    });

  next();
}
