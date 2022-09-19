import { brokersApiClient as api } from 'lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClusterName } from 'redux/interfaces';
import { BrokerConfigItem } from 'generated-sources';

interface UpdateBrokerConfigProps {
  name: string;
  brokerConfigItem: BrokerConfigItem;
}

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

export function useBrokerConfig(clusterName: ClusterName, brokerId: number) {
  return useQuery(
    ['clusters', clusterName, 'brokers', brokerId, 'settings'],
    () =>
      api.getBrokerConfig({
        clusterName,
        id: brokerId,
      })
  );
}

export function useUpdateBrokerConfigByName(
  clusterName: ClusterName,
  brokerId: number
) {
  const client = useQueryClient();
  return useMutation(
    (payload: UpdateBrokerConfigProps) =>
      api.updateBrokerConfigByName({
        ...payload,
        clusterName,
        id: brokerId,
      }),
    {
      onSuccess: () =>
        client.invalidateQueries([
          'clusters',
          clusterName,
          'brokers',
          brokerId,
          'settings',
        ]),
    }
  );
}
