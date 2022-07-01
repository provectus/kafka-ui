import { kafkaConnectApiClient } from 'lib/api';
import { useQuery } from 'react-query';

import { generateUseConnectorKey, UseConnectorProps } from './useConnector';

export const generateUseConnectorTasksKey = (props: UseConnectorProps) => [
  ...generateUseConnectorKey(props),
  'tasks',
];

export default function useConnectorTasks(props: UseConnectorProps) {
  return useQuery(
    generateUseConnectorTasksKey(props),
    () => kafkaConnectApiClient.getConnectorTasks(props),
    {
      suspense: true,
    }
  );
}
