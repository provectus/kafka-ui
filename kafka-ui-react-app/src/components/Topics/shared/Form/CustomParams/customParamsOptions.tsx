import { TopicConfigOption } from 'redux/interfaces';

interface TopicConfigOptions {
  [optionName: string]: TopicConfigOption;
}

const CUSTOM_PARAMS_OPTIONS: TopicConfigOptions = {
  'compression.type': {
    name: 'compression.type',
    defaultValue: 'producer',
  },
  'leader.replication.throttled.replicas': {
    name: 'leader.replication.throttled.replicas',
    defaultValue: '',
  },
  'message.downconversion.enable': {
    name: 'message.downconversion.enable',
    defaultValue: 'true',
  },
  'segment.jitter.ms': {
    name: 'segment.jitter.ms',
    defaultValue: '0',
  },
  'flush.ms': {
    name: 'flush.ms',
    defaultValue: '9223372036854775807',
  },
  'follower.replication.throttled.replicas': {
    name: 'follower.replication.throttled.replicas',
    defaultValue: '',
  },
  'segment.bytes': {
    name: 'segment.bytes',
    defaultValue: '1073741824',
  },
  'flush.messages': {
    name: 'flush.messages',
    defaultValue: '9223372036854775807',
  },
  'message.format.version': {
    name: 'message.format.version',
    defaultValue: '2.3-IV1',
  },
  'file.delete.delay.ms': {
    name: 'file.delete.delay.ms',
    defaultValue: '60000',
  },
  'max.compaction.lag.ms': {
    name: 'max.compaction.lag.ms',
    defaultValue: '9223372036854775807',
  },
  'min.compaction.lag.ms': {
    name: 'min.compaction.lag.ms',
    defaultValue: '0',
  },
  'message.timestamp.type': {
    name: 'message.timestamp.type',
    defaultValue: 'CreateTime',
  },
  preallocate: {
    name: 'preallocate',
    defaultValue: 'false',
  },
  'min.cleanable.dirty.ratio': {
    name: 'min.cleanable.dirty.ratio',
    defaultValue: '0.5',
  },
  'index.interval.bytes': {
    name: 'index.interval.bytes',
    defaultValue: '4096',
  },
  'unclean.leader.election.enable': {
    name: 'unclean.leader.election.enable',
    defaultValue: 'true',
  },
  'retention.bytes': {
    name: 'retention.bytes',
    defaultValue: '-1',
  },
  'delete.retention.ms': {
    name: 'delete.retention.ms',
    defaultValue: '86400000',
  },
  'segment.ms': {
    name: 'segment.ms',
    defaultValue: '604800000',
  },
  'message.timestamp.difference.max.ms': {
    name: 'message.timestamp.difference.max.ms',
    defaultValue: '9223372036854775807',
  },
  'segment.index.bytes': {
    name: 'segment.index.bytes',
    defaultValue: '10485760',
  },
};

export default CUSTOM_PARAMS_OPTIONS;
