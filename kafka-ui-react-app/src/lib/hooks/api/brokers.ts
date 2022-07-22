import { brokersApiClient as api } from 'lib/api';
import { useQuery } from '@tanstack/react-query';
import { ClusterName } from 'redux/interfaces';

export function useBrokers(clusterName: ClusterName) {
  return useQuery(
    ['clusters', clusterName, 'brokers'],
    () => api.getBrokers({ clusterName }),
    { refetchInterval: 5000 }
  );
}

export function useBrokerMetrics(clusterName: ClusterName, brokerId: number) {
  return useQuery(
    ['clusters', clusterName, 'brokers', brokerId, 'metrics'],
    () =>
      api.getBrokersMetrics({
        clusterName,
        id: brokerId,
      })
  );
}

export function useBrokerLogDirs(clusterName: ClusterName, brokerId: number) {
  return useQuery(
    ['clusters', clusterName, 'brokers', brokerId, 'logDirs'],
    () =>
      api.getAllBrokersLogdirs({
        clusterName,
        broker: [brokerId],
      })
  );
}
