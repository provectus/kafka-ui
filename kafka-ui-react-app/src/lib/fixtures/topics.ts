import {
  ConfigSource,
  ConsumerGroup,
  ConsumerGroupState,
  Topic,
  TopicConfig,
  MessageSchemaSourceEnum,
} from 'generated-sources';

export const internalTopicPayload = {
  name: '__internal.topic',
  internal: true,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 0,
  segmentCount: 1,
  underReplicatedPartitions: 0,
  partitions: [
    {
      partition: 0,
      leader: 1,
      replicas: [{ broker: 1, leader: false, inSync: true }],
      offsetMax: 0,
      offsetMin: 0,
    },
  ],
};

export const externalTopicPayload = {
  name: 'external.topic',
  internal: false,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 1263,
  segmentCount: 1,
  underReplicatedPartitions: 0,
  partitions: [
    {
      partition: 0,
      leader: 1,
      replicas: [{ broker: 1, leader: false, inSync: true }],
      offsetMax: 0,
      offsetMin: 0,
    },
  ],
};

export const topicsPayload: Topic[] = [
  internalTopicPayload,
  externalTopicPayload,
];

export const topicConsumerGroups: ConsumerGroup[] = [
  {
    groupId: 'amazon.msk.canary.group.broker-7',
    topics: 0,
    members: 0,
    simple: false,
    partitionAssignor: '',
    state: ConsumerGroupState.UNKNOWN,
    coordinator: { id: 1 },
    messagesBehind: 9,
  },
  {
    groupId: 'amazon.msk.canary.group.broker-4',
    topics: 0,
    members: 0,
    simple: false,
    partitionAssignor: '',
    state: ConsumerGroupState.COMPLETING_REBALANCE,
    coordinator: { id: 1 },
    messagesBehind: 9,
  },
];

export const topicConfigPayload: TopicConfig[] = [
  {
    name: 'compression.type',
    value: 'producer',
    defaultValue: 'producer',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'compression.type',
        value: 'producer',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
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
    defaultValue: '',
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
    defaultValue: 'true',
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
    defaultValue: '1',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'min.insync.replicas',
        value: '1',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
      {
        name: 'min.insync.replicas',
        value: '1',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
];

export const topicMessageSchema = {
  key: {
    name: 'key',
    source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "http://example.com/myURI.schema.json",
  "title": "TestRecord",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "f1": {
      "type": "integer"
    },
    "f2": {
      "type": "string"
    },
    "schema": {
      "type": "string"
    }
  }
}
`,
  },
  value: {
    name: 'value',
    source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "http://example.com/myURI1.schema.json",
  "title": "TestRecord",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "f1": {
      "type": "integer"
    },
    "f2": {
      "type": "string"
    },
    "schema": {
      "type": "string"
    }
  }
}
`,
  },
};
