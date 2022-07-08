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
