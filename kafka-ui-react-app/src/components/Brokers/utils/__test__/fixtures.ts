import { BrokerMetrics } from 'generated-sources';

export const brokerMetricsPayload: BrokerMetrics = {
  segmentSize: 23,
  segmentCount: 23,
  metrics: [
    {
      name: 'TotalFetchRequestsPerSec',
      labels: {
        canonicalName:
          'kafka.server:name=TotalFetchRequestsPerSec,topic=_connect_status,type=BrokerTopicMetrics',
      },
      value: 10,
    },
    {
      name: 'ZooKeeperRequestLatencyMs',
      value: 11,
    },
    {
      name: 'RequestHandlerAvgIdlePercent',
    },
  ],
};
export const transformedBrokerMetricsPayload =
  '{"segmentSize":23,"segmentCount":23,"metrics":[{"name":"TotalFetchRequestsPerSec","labels":{"canonicalName":"kafka.server:name=TotalFetchRequestsPerSec,topic=_connect_status,type=BrokerTopicMetrics"},"value":10},{"name":"ZooKeeperRequestLatencyMs","value":11},{"name":"RequestHandlerAvgIdlePercent"}]}';
