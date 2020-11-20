import { ClusterStats, Broker } from 'generated-sources';

export type BrokerId = Broker['id'];

export enum ZooKeeperStatus { offline, online };

export interface BrokersState extends ClusterStats {
  items: Broker[];
}
