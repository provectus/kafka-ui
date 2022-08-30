import React from 'react';
import { Task } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import useAppParams from 'lib/hooks/useAppParams';
import { useRestartConnectorTask } from 'lib/hooks/api/kafkaConnect';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { RouterParamsClusterConnectConnector } from 'lib/paths';

const ActionsCellTasks: React.FC<CellContext<Task, unknown>> = ({ row }) => {
  const { id } = row.original;
  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();
  const restartMutation = useRestartConnectorTask(routerProps);

  const restartTaskHandler = (taskId?: number) => {
    if (taskId === undefined) return;
    restartMutation.mutateAsync(taskId);
  };

  return (
    <Dropdown>
      <DropdownItem
        onClick={() => restartTaskHandler(id?.task)}
        danger
        confirm="Are you sure you want to restart the task?"
      >
        <span>Restart task</span>
      </DropdownItem>
    </Dropdown>
  );
};

export default ActionsCellTasks;
