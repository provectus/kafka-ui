import { kafkaConnectApiClient } from 'lib/api';
import { useMutation, useQueryClient } from 'react-query';
import { ConnectorAction } from 'generated-sources';

import { generateUseConnectorTasksKey } from './useConnectorTasks';
import { generateUseConnectorKey, UseConnectorProps } from './useConnector';

interface UseUpdateConnectorProps extends UseConnectorProps {
  action: ConnectorAction;
}

export default function useUpdateConnector(props: UseUpdateConnectorProps) {
  const queryClient = useQueryClient();
  return useMutation(() => kafkaConnectApiClient.updateConnectorState(props), {
    onSuccess: () => {
      return queryClient.invalidateQueries([
        generateUseConnectorKey(props),
        generateUseConnectorTasksKey(props),
      ]);
    },
  });
}
