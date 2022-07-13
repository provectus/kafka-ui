import { BrokerLogdirState } from 'components/Brokers/Broker/Broker';
import { BrokerMetrics } from 'generated-sources';

export const transformedBrokerLogDirsPayload: BrokerLogdirState[] = [
  {
    error: 'NONE',
    name: '/opt/kafka/data-0/logs',
    topics: 3,
    partitions: 4,
  },
];
export const defaultTransformedBrokerLogDirsPayload: BrokerLogdirState = {
  error: '-',
  name: '-',
  topics: 0,
  partitions: 0,
};

export const brokerMetricsPayload: BrokerMetrics = {
  segmentSize: 23,
  segmentCount: 23,
  metrics: [
    {
      name: 'TotalFetchRequestsPerSec',
      canonicalName:
        'kafka.server:name=TotalFetchRequestsPerSec,topic=_connect_status,type=BrokerTopicMetrics',
      params: {
        topic: '_connect_status',
        name: 'TotalFetchRequestsPerSec',
        type: 'BrokerTopicMetrics',
      },
      value: {
        OneMinuteRate: 19.408369293127542,
        FifteenMinuteRate: 19.44631556589501,
        Count: 191615,
        FiveMinuteRate: 19.464393718807774,
        MeanRate: 19.4233855043407,
      },
    },
    {
      name: 'ZooKeeperRequestLatencyMs',
      canonicalName:
        'kafka.server:name=ZooKeeperRequestLatencyMs,type=ZooKeeperClientMetrics',
      params: {
        name: 'ZooKeeperRequestLatencyMs',
        type: 'ZooKeeperClientMetrics',
      },
      value: {
        Mean: 4.907351022183558,
        StdDev: 10.589608223906348,
        '75thPercentile': 2,
        '98thPercentile': 10,
        Min: 0,
        '95thPercentile': 5,
        '99thPercentile': 15,
        Max: 151,
        '999thPercentile': 92.79700000000003,
        Count: 2301,
        '50thPercentile': 1,
      },
    },
    {
      name: 'RequestHandlerAvgIdlePercent',
      canonicalName:
        'kafka.server:name=RequestHandlerAvgIdlePercent,type=KafkaRequestHandlerPool',
      params: {
        name: 'RequestHandlerAvgIdlePercent',
        type: 'KafkaRequestHandlerPool',
      },
      value: {
        OneMinuteRate: 0.9999008788765713,
        FifteenMinuteRate: 0.9983845959639047,
        Count: 9937344680371,
        FiveMinuteRate: 0.9986337207880311,
        MeanRate: 0.9971616923696525,
      },
    },
    {
      name: 'BytesInPerSec',
      canonicalName:
        'kafka.server:name=BytesInPerSec,topic=_connect_status,type=BrokerTopicMetrics',
      params: {
        topic: '_connect_status',
        name: 'BytesInPerSec',
        type: 'BrokerTopicMetrics',
      },
      value: {
        OneMinuteRate: 0,
        FifteenMinuteRate: 0,
        Count: 0,
        FiveMinuteRate: 0,
        MeanRate: 0,
      },
    },
    {
      name: 'FetchMessageConversionsPerSec',
      canonicalName:
        'kafka.server:name=FetchMessageConversionsPerSec,topic=__consumer_offsets,type=BrokerTopicMetrics',
      params: {
        topic: '__consumer_offsets',
        name: 'FetchMessageConversionsPerSec',
        type: 'BrokerTopicMetrics',
      },
      value: {
        OneMinuteRate: 0,
        FifteenMinuteRate: 0,
        Count: 0,
        FiveMinuteRate: 0,
        MeanRate: 0,
      },
    },
    {
      name: 'TotalProduceRequestsPerSec',
      canonicalName:
        'kafka.server:name=TotalProduceRequestsPerSec,topic=_connect_status,type=BrokerTopicMetrics',
      params: {
        topic: '_connect_status',
        name: 'TotalProduceRequestsPerSec',
        type: 'BrokerTopicMetrics',
      },
      value: {
        OneMinuteRate: 0,
        FifteenMinuteRate: 0,
        Count: 0,
        FiveMinuteRate: 0,
        MeanRate: 0,
      },
    },
    {
      name: 'MaxLag',
      canonicalName:
        'kafka.server:clientId=Replica,name=MaxLag,type=ReplicaFetcherManager',
      params: {
        clientId: 'Replica',
        name: 'MaxLag',
        type: 'ReplicaFetcherManager',
      },
      value: {
        Value: 0,
      },
    },
    {
      name: 'UnderMinIsrPartitionCount',
      canonicalName:
        'kafka.server:name=UnderMinIsrPartitionCount,type=ReplicaManager',
      params: {
        name: 'UnderMinIsrPartitionCount',
        type: 'ReplicaManager',
      },
      value: {
        Value: 0,
      },
    },
    {
      name: 'ZooKeeperDisconnectsPerSec',
      canonicalName:
        'kafka.server:name=ZooKeeperDisconnectsPerSec,type=SessionExpireListener',
      params: {
        name: 'ZooKeeperDisconnectsPerSec',
        type: 'SessionExpireListener',
      },
      value: {
        OneMinuteRate: 0,
        FifteenMinuteRate: 0,
        Count: 0,
        FiveMinuteRate: 0,
        MeanRate: 0,
      },
    },
    {
      name: 'BytesInPerSec',
      canonicalName:
        'kafka.server:name=BytesInPerSec,topic=__confluent.support.metrics,type=BrokerTopicMetrics',
      params: {
        topic: '__confluent.support.metrics',
        name: 'BytesInPerSec',
        type: 'BrokerTopicMetrics',
      },
      value: {
        OneMinuteRate: 3.093893673470914e-70,
        FifteenMinuteRate: 0.004057932469784932,
        Count: 1263,
        FiveMinuteRate: 1.047243693828501e-12,
        MeanRate: 0.12704831069266603,
      },
    },
  ],
};
export const transformedBrokerMetricsPayload =
  '{"segmentSize":23,"segmentCount":23,"metrics":[{"name":"TotalFetchRequestsPerSec","canonicalName":"kafka.server:name=TotalFetchRequestsPerSec,topic=_connect_status,type=BrokerTopicMetrics","params":{"topic":"_connect_status","name":"TotalFetchRequestsPerSec","type":"BrokerTopicMetrics"},"value":{"OneMinuteRate":19.408369293127542,"FifteenMinuteRate":19.44631556589501,"Count":191615,"FiveMinuteRate":19.464393718807774,"MeanRate":19.4233855043407}},{"name":"ZooKeeperRequestLatencyMs","canonicalName":"kafka.server:name=ZooKeeperRequestLatencyMs,type=ZooKeeperClientMetrics","params":{"name":"ZooKeeperRequestLatencyMs","type":"ZooKeeperClientMetrics"},"value":{"Mean":4.907351022183558,"StdDev":10.589608223906348,"75thPercentile":2,"98thPercentile":10,"Min":0,"95thPercentile":5,"99thPercentile":15,"Max":151,"999thPercentile":92.79700000000003,"Count":2301,"50thPercentile":1}},{"name":"RequestHandlerAvgIdlePercent","canonicalName":"kafka.server:name=RequestHandlerAvgIdlePercent,type=KafkaRequestHandlerPool","params":{"name":"RequestHandlerAvgIdlePercent","type":"KafkaRequestHandlerPool"},"value":{"OneMinuteRate":0.9999008788765713,"FifteenMinuteRate":0.9983845959639047,"Count":9937344680371,"FiveMinuteRate":0.9986337207880311,"MeanRate":0.9971616923696525}},{"name":"BytesInPerSec","canonicalName":"kafka.server:name=BytesInPerSec,topic=_connect_status,type=BrokerTopicMetrics","params":{"topic":"_connect_status","name":"BytesInPerSec","type":"BrokerTopicMetrics"},"value":{"OneMinuteRate":0,"FifteenMinuteRate":0,"Count":0,"FiveMinuteRate":0,"MeanRate":0}},{"name":"FetchMessageConversionsPerSec","canonicalName":"kafka.server:name=FetchMessageConversionsPerSec,topic=__consumer_offsets,type=BrokerTopicMetrics","params":{"topic":"__consumer_offsets","name":"FetchMessageConversionsPerSec","type":"BrokerTopicMetrics"},"value":{"OneMinuteRate":0,"FifteenMinuteRate":0,"Count":0,"FiveMinuteRate":0,"MeanRate":0}},{"name":"TotalProduceRequestsPerSec","canonicalName":"kafka.server:name=TotalProduceRequestsPerSec,topic=_connect_status,type=BrokerTopicMetrics","params":{"topic":"_connect_status","name":"TotalProduceRequestsPerSec","type":"BrokerTopicMetrics"},"value":{"OneMinuteRate":0,"FifteenMinuteRate":0,"Count":0,"FiveMinuteRate":0,"MeanRate":0}},{"name":"MaxLag","canonicalName":"kafka.server:clientId=Replica,name=MaxLag,type=ReplicaFetcherManager","params":{"clientId":"Replica","name":"MaxLag","type":"ReplicaFetcherManager"},"value":{"Value":0}},{"name":"UnderMinIsrPartitionCount","canonicalName":"kafka.server:name=UnderMinIsrPartitionCount,type=ReplicaManager","params":{"name":"UnderMinIsrPartitionCount","type":"ReplicaManager"},"value":{"Value":0}},{"name":"ZooKeeperDisconnectsPerSec","canonicalName":"kafka.server:name=ZooKeeperDisconnectsPerSec,type=SessionExpireListener","params":{"name":"ZooKeeperDisconnectsPerSec","type":"SessionExpireListener"},"value":{"OneMinuteRate":0,"FifteenMinuteRate":0,"Count":0,"FiveMinuteRate":0,"MeanRate":0}},{"name":"BytesInPerSec","canonicalName":"kafka.server:name=BytesInPerSec,topic=__confluent.support.metrics,type=BrokerTopicMetrics","params":{"topic":"__confluent.support.metrics","name":"BytesInPerSec","type":"BrokerTopicMetrics"},"value":{"OneMinuteRate":3.093893673470914e-70,"FifteenMinuteRate":0.004057932469784932,"Count":1263,"FiveMinuteRate":1.047243693828501e-12,"MeanRate":0.12704831069266603}}]}';
