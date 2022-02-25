import { ConsumerGroupState } from 'generated-sources';

export const consumerGroup1 = {
  groupId: 'group1',
  members: 1,
  topics: 1,
  simple: false,
  partitionAssignor: 'range',
  state: ConsumerGroupState.STABLE,
  coordinator: {
    id: 2,
    host: 'dev-cp-kafka-0.dev-cp-kafka-headless.kafka-ui',
    port: 9092,
  },
  messagesBehind: 0,
};

export const consumerGroup2 = {
  groupId: 'group2',
  members: 1,
  topics: 1,
  simple: false,
  partitionAssignor: 'range',
  state: ConsumerGroupState.STABLE,
  coordinator: {
    id: 2,
    host: 'dev-cp-kafka-0.dev-cp-kafka-headless.kafka-ui',
    port: 9092,
  },
  messagesBehind: 0,
};

export const consumerGroup = consumerGroup1;

export const noConsumerGroupsResponse = {
  pageCount: 1,
  consumerGroups: [],
};
export const someComnsumerGroupsResponse = {
  pageCount: 1,
  consumerGroups: [consumerGroup1, consumerGroup2],
};

export const searchComnsumerGroupsResponse = {
  pageCount: 1,
  consumerGroups: [consumerGroup1],
};
