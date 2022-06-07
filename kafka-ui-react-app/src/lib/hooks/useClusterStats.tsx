import { clustersApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName } from 'redux/interfaces';

export default function useClusterStats(clusterName: ClusterName) {
  return useQuery(
    ['clusterStats', clusterName],
    () => clustersApiClient.getClusterStats({ clusterName }),
    { suspense: true, refetchInterval: 5000 }
  );
}
