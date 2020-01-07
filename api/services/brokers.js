'use strict'

const brokers = require('../mocks/brokers');
const brokerMetrics = require('../mocks/brokerMetrics');

module.exports = function (fastify, opts, next) {
  fastify
    .get('/clusters/:clusterId/brokers', function (request, reply) {
      reply.send(brokers[request.params.clusterId]);
    })
    .get('/clusters/:clusterId/metrics/broker', function (request, reply) {
      reply.send(brokerMetrics[request.params.clusterId]);
    });

  next();
}
