import { ConfigurationParameters } from 'generated-sources';

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: process.env.REACT_APP_API_URL || '',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export const TOPIC_NAME_VALIDATION_PATTERN = RegExp(/^[.,A-Za-z0-9_-]+$/);
export const SCHEMA_NAME_VALIDATION_PATTERN = RegExp(/^[.,A-Za-z0-9_-]+$/);

export const TOPIC_CUSTOM_PARAMS: Record<string, string> = {
  'compression.type': 'producer',
  'leader.replication.throttled.replicas': '',
  'message.downconversion.enable': 'true',
  'segment.jitter.ms': '0',
  'flush.ms': '9223372036854775807',
  'follower.replication.throttled.replicas': '',
  'segment.bytes': '1073741824',
  'flush.messages': '9223372036854775807',
  'message.format.version': '2.3-IV1',
  'file.delete.delay.ms': '60000',
  'max.compaction.lag.ms': '9223372036854775807',
  'min.compaction.lag.ms': '0',
  'message.timestamp.type': 'CreateTime',
  preallocate: 'false',
  'min.cleanable.dirty.ratio': '0.5',
  'index.interval.bytes': '4096',
  'unclean.leader.election.enable': 'true',
  'retention.bytes': '-1',
  'delete.retention.ms': '86400000',
  'segment.ms': '604800000',
  'message.timestamp.difference.max.ms': '9223372036854775807',
  'segment.index.bytes': '10485760',
};

export const MILLISECONDS_IN_WEEK = 604_800_000;
export const MILLISECONDS_IN_DAY = 86_400_000;
export const MILLISECONDS_IN_SECOND = 1_000;

export const BYTES_IN_GB = 1_073_741_824;

export const PER_PAGE = 25;
