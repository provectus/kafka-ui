import { ConsumerGroupState } from 'generated-sources';

export const consumerGroupPayload = {
  groupId: 'amazon.msk.canary.group.broker-1',
  members: 0,
  topics: 2,
  simple: false,
  partitionAssignor: '',
  state: ConsumerGroupState.EMPTY,
  coordinator: {
    id: 2,
    host: 'b-2.kad-msk.st2jzq.c6.kafka.eu-west-1.amazonaws.com',
  },
  messagesBehind: 0,
  partitions: [
    {
      topic: '__amazon_msk_canary',
      partition: 1,
      currentOffset: 0,
      endOffset: 0,
      messagesBehind: 0,
      consumerId: undefined,
      host: undefined,
    },
    {
      topic: '__amazon_msk_canary',
      partition: 0,
      currentOffset: 56932,
      endOffset: 56932,
      messagesBehind: 0,
      consumerId: undefined,
      host: undefined,
    },
    {
      topic: 'other_topic',
      partition: 3,
      currentOffset: 56932,
      endOffset: 56932,
      messagesBehind: 0,
      consumerId: undefined,
      host: undefined,
    },
    {
      topic: 'other_topic',
      partition: 4,
      currentOffset: 56932,
      endOffset: 56932,
      messagesBehind: 0,
      consumerId: undefined,
      host: undefined,
    },
  ],
};
