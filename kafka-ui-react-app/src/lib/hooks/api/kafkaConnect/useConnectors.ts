import { kafkaConnectApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName } from 'redux/interfaces';

export default function useConnectors(
  clusterName: ClusterName,
  search?: string
) {
  return useQuery(
    ['clusters', clusterName, 'connectors', { search }],
    () => kafkaConnectApiClient.getAllConnectors({ clusterName, search }),
    {
      suspense: true,
    }
  );
}
