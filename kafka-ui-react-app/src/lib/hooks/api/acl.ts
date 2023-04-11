import { aclApiClient as api } from 'lib/api';
import { useQuery } from '@tanstack/react-query';
import { ClusterName } from 'redux/interfaces';

export function useAcls(clusterName: ClusterName) {
  return useQuery(
    ['clusters', clusterName, 'acls'],
    () => api.listAcls({ clusterName }),
    {
      suspense: false,
    }
  );
}
