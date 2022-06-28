import { brokersApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName } from 'redux/interfaces';

export default function useBrokersMetrics(
  clusterName: ClusterName,
  brokerId: number
) {
  return useQuery(
    ['metrics', clusterName, brokerId],
    () =>
      brokersApiClient.getBrokersMetrics({
        clusterName,
        id: brokerId,
      }),
    { suspense: true, refetchInterval: 5000 }
  );
}
