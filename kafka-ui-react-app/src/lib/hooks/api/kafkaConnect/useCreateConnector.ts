import { NewConnector } from 'generated-sources';
import { kafkaConnectApiClient } from 'lib/api';
import { useMutation, useQueryClient } from 'react-query';
import { ClusterName, ConnectName } from 'redux/interfaces';

export default function useCreateConnector(
  clusterName: ClusterName,
  connectName: ConnectName,
  newConnector: NewConnector
) {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      kafkaConnectApiClient.createConnector({
        clusterName,
        connectName,
        newConnector,
      }),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([
          'clusters',
          clusterName,
          'connectors',
        ]);
      },
    }
  );
}
