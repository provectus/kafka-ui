import { ClusterStats } from 'generated-sources';

export const clusterStats: ClusterStats = {
  brokerCount: 1,
  zooKeeperStatus: 1,
  activeControllers: 1,
  onlinePartitionCount: 6,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 6,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [{ brokerId: 1, segmentSize: 6538, segmentCount: 6 }],
};
