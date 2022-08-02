import { clustersApiClient as api } from 'lib/api';
import { useQuery } from '@tanstack/react-query';
import { ClusterName } from 'redux/interfaces';

export function useClusters() {
  return useQuery(['clusters'], () => api.getClusters());
}
export function useClusterStats(clusterName: ClusterName) {
  return useQuery(
    ['clusterStats', clusterName],
    () => api.getClusterStats({ clusterName }),
    { refetchInterval: 5000 }
  );
}
