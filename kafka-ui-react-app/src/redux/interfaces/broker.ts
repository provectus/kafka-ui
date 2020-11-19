import { Broker } from 'generated-sources';

export type BrokerId = string;

// export interface Broker {
//   brokerId: BrokerId;
//   bytesInPerSec: number;
//   segmentSize: number;
//   partitionReplicas: number;
//   bytesOutPerSec: number;
// };

export enum ZooKeeperStatus { offline, online };

export interface BrokerDiskUsage {
  brokerId: BrokerId;
  segmentSize: number;
}

export interface BrokerMetrics {
  brokerCount: number;
  zooKeeperStatus: ZooKeeperStatus;
  activeControllers: number;
  onlinePartitionCount: number;
  offlinePartitionCount: number;
  inSyncReplicasCount: number,
  outOfSyncReplicasCount: number,
  underReplicatedPartitionCount: number;
  diskUsage: BrokerDiskUsage[];
}

export interface BrokersState extends BrokerMetrics {
  items: Broker[];
}
