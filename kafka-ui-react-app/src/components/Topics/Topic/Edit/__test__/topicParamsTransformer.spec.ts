import topicParamsTransformer from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { TopicWithDetailedInfo } from 'redux/interfaces';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';
import { CleanUpPolicy, ConfigSource } from 'generated-sources';

const startParams: TopicWithDetailedInfo | undefined = {
  config: [
    {
      name: 'compression.type',
      value: 'producer',
      defaultValue: 'producer',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'compression.type',
          value: 'producer',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.value.schema.validation',
      value: 'false',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'leader.replication.throttled.replicas',
      value: '',
      defaultValue: '',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'confluent.key.subject.name.strategy',
      value: 'io.confluent.kafka.serializers.subject.TopicNameStrategy',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'message.downconversion.enable',
      value: 'true',
      defaultValue: 'true',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.message.downconversion.enable',
          value: 'true',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'min.insync.replicas',
      value: '12345',
      defaultValue: '1',
      source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'min.insync.replicas',
          value: '12345',
          source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
        },
        {
          name: 'min.insync.replicas',
          value: '1',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'segment.jitter.ms',
      value: '0',
      defaultValue: '0',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'cleanup.policy',
      value: 'delete',
      defaultValue: 'delete',
      source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'cleanup.policy',
          value: 'delete',
          source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
        },
        {
          name: 'log.cleanup.policy',
          value: 'delete',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'flush.ms',
      value: '9223372036854775807',
      defaultValue: '9223372036854775807',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'confluent.tier.local.hotset.ms',
      value: '86400000',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'confluent.tier.local.hotset.ms',
          value: '86400000',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'follower.replication.throttled.replicas',
      value: '',
      defaultValue: '',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'confluent.tier.local.hotset.bytes',
      value: '-1',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'confluent.tier.local.hotset.bytes',
          value: '-1',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.value.subject.name.strategy',
      value: 'io.confluent.kafka.serializers.subject.TopicNameStrategy',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'segment.bytes',
      value: '1073741824',
      defaultValue: '1073741824',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.segment.bytes',
          value: '1073741824',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'retention.ms',
      value: '43200000',
      defaultValue: '604800000',
      source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'retention.ms',
          value: '43200000',
          source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'flush.messages',
      value: '9223372036854775807',
      defaultValue: '9223372036854775807',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.flush.interval.messages',
          value: '9223372036854775807',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.tier.enable',
      value: 'false',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'confluent.tier.enable',
          value: 'false',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.tier.segment.hotset.roll.min.bytes',
      value: '104857600',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'confluent.tier.segment.hotset.roll.min.bytes',
          value: '104857600',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.segment.speculative.prefetch.enable',
      value: 'false',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'confluent.segment.speculative.prefetch.enable',
          value: 'false',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'message.format.version',
      value: '2.7-IV2',
      defaultValue: '2.7-IV2',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.message.format.version',
          value: '2.7-IV2',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'max.compaction.lag.ms',
      value: '9223',
      defaultValue: '9223372036854775807',
      source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'max.compaction.lag.ms',
          value: '9223',
          source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
        },
        {
          name: 'log.cleaner.max.compaction.lag.ms',
          value: '9223372036854775807',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'file.delete.delay.ms',
      value: '60000',
      defaultValue: '60000',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.segment.delete.delay.ms',
          value: '60000',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'max.message.bytes',
      value: '100001',
      defaultValue: '1000012',
      source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'max.message.bytes',
          value: '100001',
          source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
        },
        {
          name: 'message.max.bytes',
          value: '1048588',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'min.compaction.lag.ms',
      value: '0',
      defaultValue: '0',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.cleaner.min.compaction.lag.ms',
          value: '0',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'message.timestamp.type',
      value: 'CreateTime',
      defaultValue: 'CreateTime',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.message.timestamp.type',
          value: 'CreateTime',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'preallocate',
      value: 'false',
      defaultValue: 'false',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.preallocate',
          value: 'false',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.placement.constraints',
      value: '',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'min.cleanable.dirty.ratio',
      value: '0.5',
      defaultValue: '0.5',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.cleaner.min.cleanable.ratio',
          value: '0.5',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'index.interval.bytes',
      value: '4096',
      defaultValue: '4096',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.index.interval.bytes',
          value: '4096',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'unclean.leader.election.enable',
      value: 'false',
      defaultValue: 'false',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'unclean.leader.election.enable',
          value: 'false',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'retention.bytes',
      value: '21474836480',
      defaultValue: '-1',
      source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'retention.bytes',
          value: '21474836480',
          source: 'DYNAMIC_TOPIC_CONFIG' as ConfigSource,
        },
        {
          name: 'log.retention.bytes',
          value: '-1',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'delete.retention.ms',
      value: '86400000',
      defaultValue: '86400000',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.cleaner.delete.retention.ms',
          value: '86400000',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.prefer.tier.fetch.ms',
      value: '-1',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'confluent.prefer.tier.fetch.ms',
          value: '-1',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'confluent.key.schema.validation',
      value: 'false',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'segment.ms',
      value: '604800000',
      defaultValue: '604800000',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [],
    },
    {
      name: 'message.timestamp.difference.max.ms',
      value: '9223372036854775807',
      defaultValue: '9223372036854775807',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.message.timestamp.difference.max.ms',
          value: '9223372036854775807',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
    {
      name: 'segment.index.bytes',
      value: '10485760',
      defaultValue: '10485760',
      source: 'DEFAULT_CONFIG' as ConfigSource,
      isSensitive: false,
      isReadOnly: false,
      synonyms: [
        {
          name: 'log.index.size.max.bytes',
          value: '10485760',
          source: 'DEFAULT_CONFIG' as ConfigSource,
        },
      ],
    },
  ],
  name: 'testven9',
  internal: false,
  partitions: [
    {
      partition: 0,
      leader: 1,
      replicas: [
        {
          broker: 1,
          leader: false,
          inSync: true,
        },
        {
          broker: 0,
          leader: true,
          inSync: true,
        },
      ],
      offsetMax: 0,
      offsetMin: 0,
    },
    {
      partition: 1,
      leader: 0,
      replicas: [
        {
          broker: 0,
          leader: false,
          inSync: true,
        },
        {
          broker: 2,
          leader: true,
          inSync: true,
        },
      ],
      offsetMax: 0,
      offsetMin: 0,
    },
  ],
  partitionCount: 2,
  replicationFactor: 2,
  replicas: 4,
  inSyncReplicas: 4,
  segmentSize: 0,
  segmentCount: 4,
  underReplicatedPartitions: 0,
  cleanUpPolicy: 'DELETE' as CleanUpPolicy,
};

const completedParams = {
  partitions: 2,
  replicationFactor: 2,
  minInSyncReplicas: 1,
  cleanupPolicy: 'delete',
  retentionBytes: 21474836480,
  maxMessageBytes: 100001,
  name: 'testven9',
  minInsyncReplicas: 12345,
  retentionMs: 43200000,
  customParams: [
    {
      name: 'max.compaction.lag.ms',
      value: '9223',
    },
    {
      name: 'retention.bytes',
      value: '21474836480',
    },
  ],
};

describe('topicParamsTransformer', () => {
  it('topic not found', () => {
    expect(topicParamsTransformer(undefined)).toEqual(DEFAULTS);
  });

  it('topic  found', () => {
    expect(topicParamsTransformer(startParams)).toEqual(completedParams);
  });
});
