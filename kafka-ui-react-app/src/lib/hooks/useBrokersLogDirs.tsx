import { brokersApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName } from 'redux/interfaces';

export default function useBrokersLogDirs(
  clusterName: ClusterName,
  brokerId: number
) {
  return useQuery(
    ['logDirs', clusterName, brokerId],
    () =>
      brokersApiClient.getAllBrokersLogdirs({
        clusterName,
        broker: [brokerId],
      }),
    { suspense: true, refetchInterval: 5000 }
  );
}
