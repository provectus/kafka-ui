import {
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageTimestampTypeEnum,
} from 'generated-sources';

export const topicMessagePayload: TopicMessage = {
  partition: 29,
  offset: 14,
  timestamp: new Date('2021-07-21T23:25:14.865Z'),
  timestampType: TopicMessageTimestampTypeEnum.CREATE_TIME,
  key: 'schema-registry',
  headers: {},
  content:
    '{"host":"schemaregistry1","port":8085,"master_eligibility":true,"scheme":"http","version":1}',
};

export const topicMessagePayloadV2: TopicMessage = {
  ...topicMessagePayload,
  partition: 28,
  offset: 88,
};

export const topicMessagesMetaPayload: TopicMessageConsuming = {
  bytesConsumed: 1830,
  elapsedMs: 440,
  messagesConsumed: 2301,
  isCancelled: false,
};
