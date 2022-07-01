import { kafkaConnectApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName } from 'redux/interfaces';

export default function useConnects(clusterName: ClusterName) {
  return useQuery(
    ['clusters', clusterName, 'connects'],
    () => kafkaConnectApiClient.getConnects({ clusterName }),
    {
      suspense: true,
    }
  );
}
