import { FetchStatus } from "types";

export enum ClusterStatus {
  Online = 'online',
  Offline = 'offline',
}

export type ClusterId = string;

export interface Cluster {
  id: ClusterId;
  name: string;
  defaultCluster: boolean;
  status: ClusterStatus;
  brokerCount: number;
  onlinePartitionCount: number;
  topicCount: number;
}

export interface ClustersState {
  fetchStatus: FetchStatus;
  items: Cluster[];
}
