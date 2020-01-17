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
    })
    .post('/clusters/:clusterId/topics', function (request, reply) {
      /* Payload
        {
          "name":"AlphaNumeric-String_with,and.",
          "partitions":"1",
          "replicationFactor":"1",
          "configs": {
            "retention.ms": "604800000",
            "retention.bytes": "-1",
            "max.message.bytes":"1000012",
            "min.insync.replicas":"1"
          }
        }
      */

      reply.code(201).send();
    });

  next();
}
