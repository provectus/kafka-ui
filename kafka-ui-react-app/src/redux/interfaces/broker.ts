import { ClusterStats, Broker } from 'generated-sources';

export type BrokerId = Broker['id'];

export interface BrokersState extends ClusterStats {
  items: Broker[];
}
