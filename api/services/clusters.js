'use strict'

module.exports = function (fastify, opts, next) {
  fastify.get('/clusters', function (request, reply) {
    reply.send([
      {
        id: 'wrYGf-csNgiGdK7B_ADF7Z',
        name: 'fake.cluster',
        defaultCluster: true,
        status: 'online',
        brokerCount: 1,
        onlinePartitionCount: 20,
        topicCount: 2,
        bytesInPerSec: Math.ceil(Math.random() * 10_000),
        bytesOutPerSec: Math.ceil(Math.random() * 10_000),
      },
      {
        id: 'dMMQx-WRh77BKYas_g2ZTz',
        name: 'kafka-ui.cluster',
        default: false,
        status: 'offline',
        brokerCount: 0,
        onlinePartitionCount: 0,
        topicCount: 0,
        bytesInPerSec: Math.ceil(Math.random() * 10_000),
        bytesOutPerSec: Math.ceil(Math.random() * 10_000),
      },
    ]);
  });

  next();
}
