import {
  ConfigSource,
  ConsumerGroup,
  ConsumerGroupState,
  Topic,
  TopicConfig,
  TopicAnalysis,
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
    consumerLag: 9,
  },
  {
    groupId: 'amazon.msk.canary.group.broker-4',
    topics: 0,
    members: 0,
    simple: false,
    partitionAssignor: '',
    state: ConsumerGroupState.COMPLETING_REBALANCE,
    coordinator: { id: 1 },
    consumerLag: 9,
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

const topicStatsSize = {
  sum: 0,
  avg: 0,
  prctl50: 0,
  prctl75: 0,
  prctl95: 0,
  prctl99: 0,
  prctl999: 0,
};
export const topicStatsPayload: TopicAnalysis = {
  progress: {
    startedAt: 1659984559167,
    completenessPercent: 43,
    msgsScanned: 18077002,
    bytesScanned: 6750901718,
  },
  result: {
    startedAt: 1659984559095,
    finishedAt: 1659984617816,
    totalStats: {
      totalMsgs: 18194715,
      minOffset: 98869591,
      maxOffset: 100576010,
      minTimestamp: 1659719759485,
      maxTimestamp: 1659984603419,
      nullKeys: 18194715,
      nullValues: 0,
      approxUniqKeys: 0,
      approxUniqValues: 17817283,
      keySize: topicStatsSize,
      valueSize: topicStatsSize,
      hourlyMsgCounts: [
        { hourStart: 1659718800000, count: 16157 },
        { hourStart: 1659722400000, count: 225790 },
      ],
    },
    partitionStats: [
      {
        partition: 0,
        totalMsgs: 1515285,
        minOffset: 99060726,
        maxOffset: 100576010,
        minTimestamp: 1659722684090,
        maxTimestamp: 1659984603419,
        nullKeys: 1515285,
        nullValues: 0,
        approxUniqKeys: 0,
        approxUniqValues: 1515285,
        keySize: topicStatsSize,
        valueSize: topicStatsSize,
        hourlyMsgCounts: [
          { hourStart: 1659722400000, count: 18040 },
          { hourStart: 1659726000000, count: 20070 },
        ],
      },
      {
        partition: 1,
        totalMsgs: 1534422,
        minOffset: 98897827,
        maxOffset: 100432248,
        minTimestamp: 1659722803993,
        maxTimestamp: 1659984603416,
        nullKeys: 1534422,
        nullValues: 0,
        approxUniqKeys: 0,
        approxUniqValues: 1516431,
        keySize: topicStatsSize,
        valueSize: topicStatsSize,
        hourlyMsgCounts: [{ hourStart: 1659722400000, count: 19058 }],
      },
    ],
  },
};
