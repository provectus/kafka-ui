import { Cluster, ServerStatus } from 'generated-sources';

export const onlineCluster: Cluster = {
  name: 'secondLocal',
  defaultCluster: false,
  status: ServerStatus.ONLINE,
  brokerCount: 1,
  onlinePartitionCount: 6,
  topicCount: 3,
  bytesInPerSec: 0.00003061819685376471,
  bytesOutPerSec: 5.737800890036267,
  readOnly: false,
};

export const offlineCluster: Cluster = {
  name: 'local',
  defaultCluster: true,
  status: ServerStatus.OFFLINE,
  brokerCount: 1,
  onlinePartitionCount: 2,
  topicCount: 2,
  bytesInPerSec: 8000.00000673768,
  bytesOutPerSec: 0.8153063567297119,
  readOnly: true,
};

export const clusters: Cluster[] = [onlineCluster, offlineCluster];
