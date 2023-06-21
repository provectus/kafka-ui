import { SelectOption } from 'components/common/Select/Select';
import { ConfigurationParameters, ConsumerGroupState } from 'generated-sources';

declare global {
  interface Window {
    basePath: string;
  }
}

export const BASE_PARAMS: ConfigurationParameters = {
  basePath: window.basePath || '',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export const TOPIC_NAME_VALIDATION_PATTERN = /^[a-zA-Z0-9._-]+$/;
export const SCHEMA_NAME_VALIDATION_PATTERN = /^[.,A-Za-z0-9_/-]+$/;

export const TOPIC_CUSTOM_PARAMS_PREFIX = 'customParams';
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

export const NOT_SET = -1;
export const BYTES_IN_GB = 1_073_741_824;
export const BUILD_VERSION_PATTERN = /v\d.\d.\d/;

export const PER_PAGE = 25;
export const MESSAGES_PER_PAGE = '100';

export const GIT_REPO_LINK = 'https://github.com/provectus/kafka-ui';
export const GIT_REPO_LATEST_RELEASE_LINK =
  'https://api.github.com/repos/provectus/kafka-ui/releases/latest';

export const LOCAL_STORAGE_KEY_PREFIX = 'kafka-ui';

export enum AsyncRequestStatus {
  initial = 'initial',
  pending = 'pending',
  fulfilled = 'fulfilled',
  rejected = 'rejected',
}

export const QUERY_REFETCH_OFF_OPTIONS = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
};

// Cluster Form Constants
export const AUTH_OPTIONS: SelectOption[] = [
  { value: 'SASL/JAAS', label: 'SASL/JAAS' },
  { value: 'SASL/GSSAPI', label: 'SASL/GSSAPI' },
  { value: 'SASL/OAUTHBEARER', label: 'SASL/OAUTHBEARER' },
  { value: 'SASL/PLAIN', label: 'SASL/PLAIN' },
  { value: 'SASL/SCRAM-256', label: 'SASL/SCRAM-256' },
  { value: 'SASL/SCRAM-512', label: 'SASL/SCRAM-512' },
  { value: 'Delegation tokens', label: 'Delegation tokens' },
  { value: 'SASL/LDAP', label: 'SASL/LDAP' },
  { value: 'SASL/AWS IAM', label: 'SASL/AWS IAM' },
  { value: 'mTLS', label: 'mTLS' },
];

export const SECURITY_PROTOCOL_OPTIONS: SelectOption[] = [
  { value: 'SASL_SSL', label: 'SASL_SSL' },
  { value: 'SASL_PLAINTEXT', label: 'SASL_PLAINTEXT' },
];
export const METRICS_OPTIONS: SelectOption[] = [
  { value: 'JMX', label: 'JMX' },
  { value: 'PROMETHEUS', label: 'PROMETHEUS' },
];

export const CONSUMER_GROUP_STATE_TOOLTIPS: Record<ConsumerGroupState, string> =
  {
    EMPTY: 'The group exists but has no members.',
    STABLE: 'Consumers are happily consuming and have assigned partitions.',
    PREPARING_REBALANCE:
      'Something has changed, and the reassignment of partitions is required.',
    COMPLETING_REBALANCE: 'Partition reassignment is in progress.',
    DEAD: 'The group is going to be removed. It might be due to the inactivity, or the group is being migrated to different group coordinator.',
    UNKNOWN: '',
  } as const;
