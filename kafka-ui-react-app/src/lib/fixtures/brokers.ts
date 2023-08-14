import { BrokerConfig, BrokersLogdirs, ConfigSource } from 'generated-sources';

export const brokersPayload = [
  { id: 100, host: 'b-1.test.kafka.amazonaws.com', port: 9092 },
  { id: 200, host: 'b-2.test.kafka.amazonaws.com', port: 9092 },
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
  {
    error: 'NONE',
    name: '/opt/kafka/data-1/logs',
  },
];

export const brokerConfigPayload: BrokerConfig[] = [
  {
    name: 'compression.type',
    value: 'producer',
    source: ConfigSource.DYNAMIC_BROKER_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'compression.type',
        value: 'producer',
        source: ConfigSource.DYNAMIC_BROKER_CONFIG,
      },
      {
        name: 'compression.type',
        value: 'producer',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.value.schema.validation',
    value: 'false',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'leader.replication.throttled.replicas',
    value: '',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'confluent.key.subject.name.strategy',
    value: 'io.confluent.kafka.serializers.subject.TopicNameStrategy',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'message.downconversion.enable',
    value: 'true',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.message.downconversion.enable',
        value: 'true',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'min.insync.replicas',
    value: '1',
    source: ConfigSource.DYNAMIC_BROKER_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'min.insync.replicas',
        value: '1',
        source: ConfigSource.DYNAMIC_BROKER_CONFIG,
      },
      {
        name: 'min.insync.replicas',
        value: '1',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
];
