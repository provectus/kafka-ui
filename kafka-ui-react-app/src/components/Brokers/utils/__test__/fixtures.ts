import { BrokerLogdirState } from 'components/Brokers/Broker/Broker';

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
