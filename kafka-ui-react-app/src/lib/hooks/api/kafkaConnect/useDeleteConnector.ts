import { kafkaConnectApiClient } from 'lib/api';
import { useMutation, useQueryClient } from 'react-query';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';

export default function useDeleteConnector(
  clusterName: ClusterName,
  connectName: ConnectName,
  connectorName: ConnectorName,
) {
  const queryClient = useQueryClient();

  return useMutation(
    () =>
      kafkaConnectApiClient.deleteConnector({
        clusterName,
        connectName,
        connectorName,
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
