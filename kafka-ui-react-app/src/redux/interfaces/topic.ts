import {
  Topic,
  TopicDetails,
  TopicConfig,
  TopicCreation,
  ConsumerGroup,
  TopicColumnsToSort,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageSchema,
  SortOrder,
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
  minInsyncReplicas: number;
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
  minInsyncReplicas: number;
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
