import { aclApiClient as api } from 'lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ClusterName } from 'redux/interfaces';
import { showSuccessAlert } from 'lib/errorHandling';
import { KafkaAcl } from 'generated-sources';

export function useAcls(clusterName: ClusterName) {
  return useQuery(
    ['clusters', clusterName, 'acls'],
    () => api.listAcls({ clusterName }),
    {
      suspense: false,
    }
  );
}

export function useCreateAclMutation(clusterName: ClusterName) {
  // const client = useQueryClient();
  return useMutation(
    (data: KafkaAcl) =>
      api.createAcl({
        clusterName,
        kafkaAcl: data,
      }),
    {
      onSuccess() {
        showSuccessAlert({
          message: 'Your ACL was created successfully',
        });
      },
    }
  );
}

export function useCreateAcl(clusterName: ClusterName) {
  const mutate = useCreateAclMutation(clusterName);

  return {
    createResource: async (param: KafkaAcl) => {
      return mutate.mutateAsync(param);
    },
    ...mutate,
  };
}
