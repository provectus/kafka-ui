import { kafkaConnectApiClient } from 'lib/api';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';

export interface UseConnectorProps {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

const connectsKey = (clusterName: ClusterName) => [
  'clusters',
  clusterName,
  'connects',
];
const connectorsKey = (clusterName: ClusterName, search?: string) => {
  const base = ['clusters', clusterName, 'connectors'];
  if (search) {
    return [...base, { search }];
  }
  return base;
};
const connectorKey = (props: UseConnectorProps) => [
  ...connectorsKey(props.clusterName),
  props.connectName,
  'connectors',
  props.connectorName,
];

export function useConnects(clusterName: ClusterName) {
  return useQuery(connectsKey(clusterName), () =>
    kafkaConnectApiClient.getConnects({ clusterName })
  );
}
export function useConnectors(clusterName: ClusterName, search?: string) {
  return useQuery(connectorsKey(clusterName, search), () =>
    kafkaConnectApiClient.getAllConnectors({ clusterName, search })
  );
}
export function useConnector(props: UseConnectorProps) {
  return useQuery(connectorKey(props), () =>
    kafkaConnectApiClient.getConnector(props)
  );
}
export function useDeleteConnector(props: UseConnectorProps) {
  const queryClient = useQueryClient();
  return useMutation(() => kafkaConnectApiClient.deleteConnector(props), {
    onSuccess: () =>
      queryClient.invalidateQueries(connectorsKey(props.clusterName)),
  });
}
