export type BrokerId = string;

export interface Broker {
  brokerId: BrokerId;
  bytesInPerSec: number;
  segmentSize: number;
  partitionReplicas: number;
  bytesOutPerSec: number;
};

export enum ZooKeeperStatus { online, offline };

export interface BrokerDiskUsage {
  brokerId: BrokerId;
  segmentSize: number;
}

export interface BrokerMetrics {
  brokerCount: number;
  zooKeeperStatus: ZooKeeperStatus;
  activeControllers: number;
  networkPoolUsage: number;
  requestPoolUsage: number;
  onlinePartitionCount: number;
  underReplicatedPartitionCount: number;
  offlinePartitionCount: number;
  diskUsageDistribution?: string;
}

export interface BrokersState extends BrokerMetrics {
  items: Broker[];
}
