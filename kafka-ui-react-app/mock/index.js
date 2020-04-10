const jsonServer = require('json-server');
const clusters = require('./payload/clusters.json');
const brokers = require('./payload/brokers.json');
const brokerMetrics = require('./payload/brokerMetrics.json');
const topics = require('./payload/topics.json');
const topicDetails = require('./payload/topicDetails.json');
const topicConfigs = require('./payload/topicConfigs.json');
const consumerGroups = require('./payload/consumerGroups.json');

const db = {
    clusters,
    brokers,
    brokerMetrics: brokerMetrics.map(({clusterName, ...rest}) => ({...rest, id: clusterName})),
    topics: topics.map((topic) => ({...topic, id: topic.name})),
    topicDetails,
    topicConfigs,
    consumerGroups: consumerGroups.map((group) => ({...group, id: group.consumerGroupId}))
};
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
    '/api/*': '/$1',
    '/clusters/:clusterName/metrics/broker': '/brokerMetrics/:clusterName',
    '/clusters/:clusterName/topics/:id': '/topicDetails',
    '/clusters/:clusterName/topics/:id/config': '/topicConfigs',
  })
);

server.use(router);

server.listen(PORT, () => {
  console.log('JSON Server is running');
});
