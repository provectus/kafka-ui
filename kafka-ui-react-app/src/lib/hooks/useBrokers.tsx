import { brokersApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName } from 'redux/interfaces';

export default function useBrokers(clusterName: ClusterName) {
  return useQuery(
    ['brokers', clusterName],
    () => brokersApiClient.getBrokers({ clusterName }),
    { suspense: true, refetchInterval: 5000 }
  );
}
