export type TopicName = string;

export enum CleanupPolicy {
  Delete = 'delete',
  Compact = 'compact',
}

export interface InputTopicConfig {
  name: string;
  value: string;
  defaultValue: string;
}

export interface TopicConfig extends InputTopicConfig {
  id: string;
}

export interface TopicConfigByName {
  byName: {
    [paramName: string]: TopicConfig;
  };
}

export interface TopicReplica {
  broker: number;
  leader: boolean;
  inSync: true;
}

export interface TopicPartition {
  partition: number;
  leader: number;
  offsetMin: number;
  offsetMax: number;
  replicas: TopicReplica[];
}

export interface TopicCustomParamOption {
  name: string;
  defaultValue: string;
}

export interface TopicDetails {
  partitions: TopicPartition[];
}

export interface Topic {
  name: TopicName;
  internal: boolean;
  partitionCount?: number;
  replicationFactor?: number;
  replicas?: number;
  inSyncReplicas?: number;
  segmentSize?: number;
  segmentCount?: number;
  underReplicatedPartitions?: number;
  partitions: TopicPartition[];
}

export interface TopicMessage {
  partition: number;
  offset: number;
  timestamp: string;
  timestampType: string;
  key: string;
  headers: Record<string, string>;
  content: any;
}

export enum SeekTypes {
  OFFSET = 'OFFSET',
  TIMESTAMP = 'TIMESTAMP',
}

export type SeekType = keyof typeof SeekTypes;

export interface TopicMessageQueryParams {
  q: string;
  limit: number;
  seekType: SeekType;
  seekTo: string[];
}

export interface TopicFormCustomParam {
  name: string;
  value: string;
}

export interface TopicFormCustomParams {
  byIndex: { [paramIndex: string]: TopicFormCustomParam };
  allIndexes: string[];
}

export interface TopicWithDetailedInfo extends Topic, TopicDetails {
  config?: TopicConfig[];
  id: string;
}

export interface TopicsState {
  byName: { [topicName: string]: TopicWithDetailedInfo };
  allNames: TopicName[];
  messages: TopicMessage[];
}

export interface TopicFormFormattedParams {
  [name: string]: string;
}

export interface TopicFormData {
  name: string;
  partitions: number;
  replicationFactor: number;
  minInSyncReplicas: number;
  cleanupPolicy: string;
  retentionMs: number;
  retentionBytes: number;
  maxMessageBytes: number;
  customParams: TopicFormCustomParams;
}
