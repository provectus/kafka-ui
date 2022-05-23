import { Topic } from 'generated-sources';

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
