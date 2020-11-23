import { Cluster as InputCLuster } from 'generated-sources';

export interface Cluster extends InputCLuster {
  id: string;
}

export type ClusterName = Cluster['name'];

export type ClusterState = Cluster[];
