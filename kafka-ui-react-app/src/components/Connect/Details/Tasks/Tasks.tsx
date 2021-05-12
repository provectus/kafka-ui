import React from 'react';
import { useParams } from 'react-router';
import { Task } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';

import ListItemContainer from './ListItem/ListItemContainer';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

export interface TasksProps {
  fetchTasks(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    silent?: boolean
  ): void;
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
    fetchTasks(clusterName, connectName, connectorName, true);
  }, [fetchTasks, clusterName, connectName, connectorName]);

  if (areTasksFetching) {
    return <PageLoader />;
  }

  return (
    <table className="table is-fullwidth">
      <thead>
        <tr>
          <th>ID</th>
          <th>Worker</th>
          <th>State</th>
          <th>Trace</th>
          <th>
            <span className="is-pulled-right">Restart</span>
          </th>
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
    </table>
  );
};

export default Tasks;
