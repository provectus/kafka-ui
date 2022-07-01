import { kafkaConnectApiClient } from 'lib/api';
import { useQuery } from 'react-query';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';

export interface UseConnectorProps {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

export const generateUseConnectorKey = (props: UseConnectorProps) => [
  'clusters',
  props.clusterName,
  'connects',
  props.connectName,
  'connectors',
  props.connectorName,
];

export default function useConnector(props: UseConnectorProps) {
  return useQuery(
    generateUseConnectorKey(props),
    () => kafkaConnectApiClient.getConnector(props),
    {
      suspense: true,
    }
  );
}
