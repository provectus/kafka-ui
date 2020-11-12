import { Cluster } from "generated-sources";

export enum ClusterStatus {
  Online = 'online',
  Offline = 'offline',
}

export type ClusterName = string;

export type ClusterState = Cluster[];
// export interface Cluster {
//   id: string;
//   name: ClusterName;
//   defaultCluster: boolean;
//   status: ClusterStatus;
//   brokerCount: number;
//   onlinePartitionCount: number;
//   topicCount: number;
//   bytesInPerSec: number;
//   bytesOutPerSec: number;
// }
