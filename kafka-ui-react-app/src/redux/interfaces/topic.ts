import {
  Topic,
  TopicDetails,
  TopicConfig,
  TopicCreation,
  GetTopicMessagesRequest,
  ConsumerGroup,
  TopicColumnsToSort,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageSchema,
  SortOrder,
} from 'generated-sources';

export type TopicName = Topic['name'];

export type CleanupPolicy = 'delete' | 'compact';

export interface TopicConfigByName {
  byName: TopicConfigParams;
}

export interface TopicConfigParams {
  [paramName: string]: TopicConfig;
}

export interface TopicConfigValue {
  name: TopicConfig['name'];
  value: TopicConfig['value'];
}

export interface TopicMessageQueryParams {
  q: GetTopicMessagesRequest['q'];
  limit: GetTopicMessagesRequest['limit'];
  seekType: GetTopicMessagesRequest['seekType'];
  seekTo: GetTopicMessagesRequest['seekTo'];
  seekDirection: GetTopicMessagesRequest['seekDirection'];
}

export interface TopicFormCustomParams {
  byIndex: TopicConfigParams;
  allIndexes: TopicName[];
}

export interface TopicWithDetailedInfo extends Topic, TopicDetails {
  config?: TopicConfig[];
  consumerGroups?: ConsumerGroup[];
  messageSchema?: TopicMessageSchema;
}

export interface TopicsState {
  byName: { [topicName: string]: TopicWithDetailedInfo };
  allNames: TopicName[];
  totalPages: number;
  search: string;
  orderBy: TopicColumnsToSort | null;
  sortOrder: SortOrder;
  consumerGroups: ConsumerGroup[];
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
