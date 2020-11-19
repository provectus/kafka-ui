import {
  Topic,
  TopicDetails,
  TopicMessage,
  TopicConfig,
  TopicFormData,
  GetTopicMessagesRequest
} from 'generated-sources';

export type TopicName = Topic['name'];

export enum CleanupPolicy {
  Delete = 'delete',
  Compact = 'compact',
}

export interface TopicConfigByName {
  byName: TopicConfigParams
}

export interface TopicConfigParams {
  [paramName: string]: TopicConfig;
}

export interface TopicConfigOption {
  name: TopicConfig['name'],
  defaultValue: TopicConfig['defaultValue']
}

export interface TopicConfigValue {
  name: TopicConfig['name'],
  value: TopicConfig['value']
}

export interface TopicMessageQueryParams {
  q: GetTopicMessagesRequest['q'];
  limit: GetTopicMessagesRequest['limit'];
  seekType: GetTopicMessagesRequest['seekType'];
  seekTo: GetTopicMessagesRequest['seekTo'];
}

export interface TopicFormCustomParams {
  byIndex: TopicConfigParams;
  allIndexes: string[];
}

export interface TopicWithDetailedInfo extends Topic, TopicDetails {
  config?: TopicConfig[];
}

export interface TopicsState {
  byName: { [topicName: string]: TopicWithDetailedInfo };
  allNames: TopicName[];
  messages: TopicMessage[];
}

export type TopicFormFormattedParams = TopicFormData["configs"];

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
