import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import {
  useConnectorTasks,
  useRestartConnectorTask,
} from 'lib/hooks/api/kafkaConnect';
import useAppParams from 'lib/hooks/useAppParams';
import { RouterParamsClusterConnectConnector } from 'lib/paths';

import TaskRow from './TaskRow';

const Tasks: React.FC = () => {
  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();
  const { data: tasks } = useConnectorTasks(routerProps);
  const restartMutation = useRestartConnectorTask(routerProps);

  const restartTaskHandler = (taskId?: number) => {
    if (taskId === undefined) return;
    restartMutation.mutateAsync(taskId);
  };

  return (
    <Table isFullwidth>
      <thead>
        <tr>
          <TableHeaderCell />
          <TableHeaderCell title="ID" />
          <TableHeaderCell title="Worker" />
          <TableHeaderCell title="State" />
          <TableHeaderCell title="Trace" />
          <TableHeaderCell />
        </tr>
      </thead>
      <tbody>
        {tasks?.length === 0 && (
          <tr>
            <td colSpan={10}>No tasks found</td>
          </tr>
        )}
        {tasks?.map((task) => (
          <TaskRow
            key={task.status?.id}
            task={task}
            restartTaskHandler={restartTaskHandler}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default Tasks;
