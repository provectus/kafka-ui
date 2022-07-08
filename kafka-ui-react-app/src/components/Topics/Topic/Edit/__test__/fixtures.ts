import { CleanUpPolicy, ConfigSource, TopicConfig } from 'generated-sources';
import { TopicWithDetailedInfo } from 'redux/interfaces/topic';

export const clusterName = 'testCluster';
export const topicName = 'testTopic';

export const config: TopicConfig[] = [
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
  {
    name: 'segment.jitter.ms',
    value: '0',
    defaultValue: '0',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'cleanup.policy',
    value: 'delete',
    defaultValue: 'delete',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'cleanup.policy',
        value: 'delete',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
      {
        name: 'log.cleanup.policy',
        value: 'delete',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'flush.ms',
    value: '9223372036854775807',
    defaultValue: '9223372036854775807',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'confluent.tier.local.hotset.ms',
    value: '86400000',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'confluent.tier.local.hotset.ms',
        value: '86400000',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'follower.replication.throttled.replicas',
    value: '',
    defaultValue: '',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'confluent.tier.local.hotset.bytes',
    value: '-1',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'confluent.tier.local.hotset.bytes',
        value: '-1',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.value.subject.name.strategy',
    value: 'io.confluent.kafka.serializers.subject.TopicNameStrategy',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'segment.bytes',
    value: '1073741824',
    defaultValue: '1073741824',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.segment.bytes',
        value: '1073741824',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'retention.ms',
    value: '604800000',
    defaultValue: '604800000',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'retention.ms',
        value: '604800000',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
    ],
  },
  {
    name: 'flush.messages',
    value: '9223372036854775807',
    defaultValue: '9223372036854775807',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.flush.interval.messages',
        value: '9223372036854775807',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.tier.enable',
    value: 'false',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'confluent.tier.enable',
        value: 'false',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.tier.segment.hotset.roll.min.bytes',
    value: '104857600',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'confluent.tier.segment.hotset.roll.min.bytes',
        value: '104857600',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.segment.speculative.prefetch.enable',
    value: 'false',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'confluent.segment.speculative.prefetch.enable',
        value: 'false',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'message.format.version',
    value: '2.7-IV2',
    defaultValue: '2.7-IV2',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.message.format.version',
        value: '2.7-IV2',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'max.compaction.lag.ms',
    value: '9223372036854775807',
    defaultValue: '9223372036854775807',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.cleaner.max.compaction.lag.ms',
        value: '9223372036854775807',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'file.delete.delay.ms',
    value: '60000',
    defaultValue: '60000',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.segment.delete.delay.ms',
        value: '60000',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'max.message.bytes',
    value: '1000012',
    defaultValue: '1000012',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'max.message.bytes',
        value: '1000012',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
      {
        name: 'message.max.bytes',
        value: '1048588',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'min.compaction.lag.ms',
    value: '0',
    defaultValue: '0',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.cleaner.min.compaction.lag.ms',
        value: '0',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'message.timestamp.type',
    value: 'CreateTime',
    defaultValue: 'CreateTime',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.message.timestamp.type',
        value: 'CreateTime',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'preallocate',
    value: 'false',
    defaultValue: 'false',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.preallocate',
        value: 'false',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.placement.constraints',
    value: '',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'min.cleanable.dirty.ratio',
    value: '0.5',
    defaultValue: '0.5',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.cleaner.min.cleanable.ratio',
        value: '0.5',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'index.interval.bytes',
    value: '4096',
    defaultValue: '4096',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.index.interval.bytes',
        value: '4096',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'unclean.leader.election.enable',
    value: 'false',
    defaultValue: 'false',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'unclean.leader.election.enable',
        value: 'false',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'retention.bytes',
    value: '-1',
    defaultValue: '-1',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'retention.bytes',
        value: '-1',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
      {
        name: 'log.retention.bytes',
        value: '-1',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'delete.retention.ms',
    value: '86400001',
    defaultValue: '86400000',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'delete.retention.ms',
        value: '86400001',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
      {
        name: 'log.cleaner.delete.retention.ms',
        value: '86400000',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.prefer.tier.fetch.ms',
    value: '-1',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'confluent.prefer.tier.fetch.ms',
        value: '-1',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'confluent.key.schema.validation',
    value: 'false',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'segment.ms',
    value: '604800000',
    defaultValue: '604800000',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [],
  },
  {
    name: 'message.timestamp.difference.max.ms',
    value: '9223372036854775807',
    defaultValue: '9223372036854775807',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.message.timestamp.difference.max.ms',
        value: '9223372036854775807',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
  {
    name: 'segment.index.bytes',
    value: '10485760',
    defaultValue: '10485760',
    source: ConfigSource.DEFAULT_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'log.index.size.max.bytes',
        value: '10485760',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
];

export const partitions = [
  {
    partition: 0,
    leader: 2,
    replicas: [
      {
        broker: 2,
        leader: false,
        inSync: true,
      },
    ],
    offsetMax: 0,
    offsetMin: 0,
  },
];

export const topicWithInfo: TopicWithDetailedInfo = {
  name: topicName,
  internal: false,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 0,
  segmentCount: 1,
  underReplicatedPartitions: 0,
  cleanUpPolicy: CleanUpPolicy.DELETE,
  partitions,
  config,
};
