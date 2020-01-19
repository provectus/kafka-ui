const jsonServer = require('json-server');
const _ = require('lodash');
const clusters = require('./payload/clusters.json');
const brokers = require('./payload/brokers.json');
const brokerMetrics = require('./payload/brokerMetrics.json');
const topics = require('./payload/topics.json');
const topicDetails = require('./payload/topicDetails.json');
const topicConfigs = require('./payload/topicConfigs.json');

const db = {
  clusters,
  brokers,
  brokerMetrics: brokerMetrics.map(({ clusterId, ...rest }) => ({ ...rest, id: clusterId })),
  topics: topics.map((topic) => ({ ...topic, id: topic.name })),
  topicDetails,
  topicConfigs,
}
const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

const PORT = 3004;
const DELAY = 0;

server.use(middlewares);
server.use((_req, _res, next) => {
  setTimeout(next, DELAY);
});

server.use(
  jsonServer.rewriter({
    '/*': '/$1',
    '/clusters/:clusterId/metrics/broker': '/brokerMetrics/:clusterId',
    '/clusters/:clusterId/topics/:id': '/topicDetails',
    '/clusters/:clusterId/topics/:id/config': '/topicDetails',
    '/clusters/:clusterId/topics/:id/config': '/topicConfigs',
  })
);

server.use(router);

server.listen(PORT, () => {
  console.log('JSON Server is running');
});
