'use strict'

module.exports = function (fastify, opts, next) {
  fastify.get('/clusters', function (request, reply) {
    reply.send([
      {
        clusterId: 'wrYGf-csNgiGdK7B_ADF7Z',
        displayName: 'fake.cluster',
        default: true,
        status: 'online',
        brokerCount: 1,
        onlinePartitionCount: 20,
        topicCount: 2,
      },
      {
        clusterId: 'dMMQx-WRh77BKYas_g2ZTz',
        displayName: 'kafka-ui.cluster',
        default: false,
        status: 'offline',
        brokerCount: 0,
        onlinePartitionCount: 0,
        topicCount: 0,
      },
    ]);
  });

  next();
}
