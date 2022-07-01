import { kafkaConnectApiClient } from 'lib/api';
import { useMutation, useQueryClient } from 'react-query';
import { ConnectorConfig } from 'redux/interfaces';

import { generateUseConnectorKey, UseConnectorProps } from './useConnector';
import { generateUseConnectorConfigKey } from './useConnectorConfig';

interface UseUpdateConnectorConfigProps extends UseConnectorProps {
  connectorConfig: ConnectorConfig;
}

export default function useUpdateConnectorConfig(
  props: UseUpdateConnectorConfigProps
) {
  const queryClient = useQueryClient();
  return useMutation(
    () =>
      kafkaConnectApiClient.setConnectorConfig({
        ...props,
        requestBody: props.connectorConfig,
      }),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([
          generateUseConnectorKey(props),
          generateUseConnectorConfigKey(props),
        ]);
      },
    }
  );
}
