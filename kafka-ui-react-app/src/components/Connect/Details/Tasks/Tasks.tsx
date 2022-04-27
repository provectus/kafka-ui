import React from 'react';
import { useParams } from 'react-router';
import { Task } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';

import ListItemContainer from './ListItem/ListItemContainer';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

export interface TasksProps {
  fetchTasks(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  areTasksFetching: boolean;
  tasks: Task[];
}

const Tasks: React.FC<TasksProps> = ({
  fetchTasks,
  areTasksFetching,
  tasks,
}) => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();

  React.useEffect(() => {
    fetchTasks({ clusterName, connectName, connectorName });
  }, [fetchTasks, clusterName, connectName, connectorName]);

  if (areTasksFetching) {
    return <PageLoader />;
  }

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
        {tasks.length === 0 && (
          <tr>
            <td colSpan={10}>No tasks found</td>
          </tr>
        )}
        {tasks.map((task) => (
          <ListItemContainer key={task.status?.id} task={task} />
        ))}
      </tbody>
    </Table>
  );
};

export default Tasks;
