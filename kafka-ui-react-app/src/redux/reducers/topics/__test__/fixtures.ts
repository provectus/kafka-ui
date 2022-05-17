import { SortOrder, Topic, ConsumerGroup } from 'generated-sources';
import { TopicsState, TopicWithDetailedInfo } from 'redux/interfaces';

export const internalTopicPayload = {
  name: '__internal.topic',
  internal: true,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 0,
  segmentCount: 1,
  underReplicatedPartitions: 0,
  partitions: [
    {
      partition: 0,
      leader: 1,
      replicas: [{ broker: 1, leader: false, inSync: true }],
      offsetMax: 0,
      offsetMin: 0,
    },
  ],
};

export const externalTopicPayload = {
  name: 'external.topic',
  internal: false,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 1263,
  segmentCount: 1,
  underReplicatedPartitions: 0,
  partitions: [
    {
      partition: 0,
      leader: 1,
      replicas: [{ broker: 1, leader: false, inSync: true }],
      offsetMax: 0,
      offsetMin: 0,
    },
  ],
};

export const topicsPayload: Topic[] = [
  internalTopicPayload,
  externalTopicPayload,
];

export const getTopicStateFixtures = (
  topics: TopicWithDetailedInfo[],
  consumerGroups?: ConsumerGroup[]
): TopicsState => {
  const byName = topics.reduce((acc: { [i in string]: Topic }, curr) => {
    const obj = { ...acc };
    obj[curr.name] = curr;
    return obj;
  }, {} as { [i in string]: Topic });

  const allNames = Object.keys(byName);

  return {
    byName,
    allNames,
    totalPages: 1,
    search: '',
    orderBy: null,
    sortOrder: SortOrder.ASC,
    consumerGroups:
      consumerGroups && consumerGroups.length ? consumerGroups : [],
  };
};
