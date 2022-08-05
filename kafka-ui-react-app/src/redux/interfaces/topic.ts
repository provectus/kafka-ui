import {
  Topic,
  TopicConfig,
  TopicCreation,
  TopicMessage,
  TopicMessageConsuming,
} from 'generated-sources';

export type TopicName = Topic['name'];

interface TopicConfigParams {
  [paramName: string]: TopicConfig;
}

export interface TopicConfigByName {
  byName: TopicConfigParams;
}

interface TopicFormCustomParams {
  byIndex: TopicConfigParams;
  allIndexes: TopicName[];
}

export type TopicFormFormattedParams = TopicCreation['configs'];

export interface TopicFormDataRaw {
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

export interface TopicFormData {
  name: string;
  partitions: number;
  replicationFactor: number;
  minInSyncReplicas: number;
  cleanupPolicy: string;
  retentionMs: number;
  retentionBytes: number;
  maxMessageBytes: number;
  customParams: {
    name: string;
    value: string;
  }[];
}

export interface TopicMessagesState {
  messages: TopicMessage[];
  phase?: string;
  meta: TopicMessageConsuming;
  isFetching: boolean;
}
