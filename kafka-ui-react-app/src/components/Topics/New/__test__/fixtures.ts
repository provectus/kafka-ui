import { CleanUpPolicy, Topic } from 'generated-sources';

export const createTopicPayload: Record<string, unknown> = {
  name: 'test-topic',
  partitions: 1,
  replicationFactor: 1,
  configs: {
    'cleanup.policy': 'delete',
    'retention.ms': '604800000',
    'retention.bytes': '-1',
    'max.message.bytes': '1000012',
    'min.insync.replicas': '1',
  },
};

export const createTopicResponsePayload: Topic = {
  name: 'local',
  internal: false,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 0,
  segmentCount: 0,
  underReplicatedPartitions: 0,
  cleanUpPolicy: CleanUpPolicy.DELETE,
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
