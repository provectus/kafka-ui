import { BrokersLogdirs } from 'generated-sources';

export const brokersPayload = [
  { id: 1, host: 'b-1.test.kafka.amazonaws.com', port: 9092 },
  { id: 2, host: 'b-2.test.kafka.amazonaws.com', port: 9092 },
];

const partition = {
  broker: 2,
  offsetLag: 0,
  partition: 2,
  size: 0,
};
const topics = {
  name: '_confluent-ksql-devquery_CTAS_NUMBER_OF_TESTS_59-Aggregate-Aggregate-Materialize-changelog',
  partitions: [partition],
};

export const brokerLogDirsPayload: BrokersLogdirs[] = [
  {
    error: 'NONE',
    name: '/opt/kafka/data-0/logs',
    topics: [
      {
        ...topics,
        partitions: [partition, partition, partition],
      },
      topics,
      {
        ...topics,
        partitions: [],
      },
    ],
  },
];
