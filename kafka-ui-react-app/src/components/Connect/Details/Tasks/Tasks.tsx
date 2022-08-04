import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import {
  useConnectorTasks,
  useRestartConnectorTask,
} from 'lib/hooks/api/kafkaConnect';
import useAppParams from 'lib/hooks/useAppParams';
import { RouterParamsClusterConnectConnector } from 'lib/paths';
import getTagColor from 'components/common/Tag/getTagColor';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';

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
          <tr key={task.status?.id}>
            <td>{task.status?.id}</td>
            <td>{task.status?.workerId}</td>
            <td>
              <Tag color={getTagColor(task.status)}>{task.status.state}</Tag>
            </td>
            <td>{task.status.trace || 'null'}</td>
            <td style={{ width: '5%' }}>
              <div>
                <Dropdown>
                  <DropdownItem
                    onClick={() => restartTaskHandler(task.id?.task)}
                    danger
                  >
                    <span>Restart task</span>
                  </DropdownItem>
                </Dropdown>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Tasks;
