import { Cluster, ServerStatus } from 'generated-sources';

export const onlineClusterPayload: Cluster = {
  name: 'secondLocal',
  defaultCluster: true,
  status: ServerStatus.ONLINE,
  brokerCount: 1,
  onlinePartitionCount: 6,
  topicCount: 3,
  bytesInPerSec: 1.55,
  bytesOutPerSec: 9.314,
  readOnly: false,
  features: [],
};
export const offlineClusterPayload: Cluster = {
  name: 'local',
  defaultCluster: false,
  status: ServerStatus.OFFLINE,
  brokerCount: 1,
  onlinePartitionCount: 2,
  topicCount: 2,
  bytesInPerSec: 3.42,
  bytesOutPerSec: 4.14,
  features: [],
  readOnly: true,
};

export const clustersPayload: Cluster[] = [
  onlineClusterPayload,
  offlineClusterPayload,
];

export const clusterStatsPayload = {
  brokerCount: 2,
  activeControllers: 100,
  onlinePartitionCount: 138,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 239,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [
    { brokerId: 100, segmentSize: 334567, segmentCount: 245 },
    { brokerId: 200, segmentSize: 12345678, segmentCount: 121 },
  ],
  version: '2.2.1',
};
