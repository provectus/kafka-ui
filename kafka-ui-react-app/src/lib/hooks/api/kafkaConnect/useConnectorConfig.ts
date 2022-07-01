import { kafkaConnectApiClient } from 'lib/api';
import { useQuery } from 'react-query';

import { generateUseConnectorKey, UseConnectorProps } from './useConnector';

export const generateUseConnectorConfigKey = (props: UseConnectorProps) => [
  ...generateUseConnectorKey(props),
  'config',
];

export default function useConnectorConfig(props: UseConnectorProps) {
  return useQuery(
    generateUseConnectorConfigKey(props),
    () => kafkaConnectApiClient.getConnectorConfig(props),
    {
      suspense: true,
    }
  );
}
