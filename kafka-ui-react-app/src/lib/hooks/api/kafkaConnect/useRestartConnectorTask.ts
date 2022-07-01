import { kafkaConnectApiClient } from 'lib/api';
import { useMutation, useQueryClient } from 'react-query';
import { TaskId } from 'generated-sources';

import { generateUseConnectorTasksKey } from './useConnectorTasks';
import { UseConnectorProps } from './useConnector';

interface UseRestartConnectorTaskProps extends UseConnectorProps {
  taskId: TaskId['task'];
}

export default function useRestartConnectorTask(
  props: UseRestartConnectorTaskProps
) {
  const queryClient = useQueryClient();
  return useMutation(
    () =>
      kafkaConnectApiClient.restartConnectorTask({
        ...props,
        taskId: Number(props.taskId),
      }),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(
          generateUseConnectorTasksKey(props)
        );
      },
    }
  );
}
