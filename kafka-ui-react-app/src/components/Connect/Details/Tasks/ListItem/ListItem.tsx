import React from 'react';
import { useParams } from 'react-router-dom';
import { Task, TaskId } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import StatusTag from 'components/Connect/StatusTag';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

export interface ListItemProps {
  task: Task;
  restartTask(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    taskId: TaskId['task']
  ): Promise<void>;
}

const ListItem: React.FC<ListItemProps> = ({ task, restartTask }) => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();
  const [restarting, setRestarting] = React.useState(false);

  const restartTaskHandler = React.useCallback(async () => {
    setRestarting(true);
    await restartTask(clusterName, connectName, connectorName, task.id?.task);
    setRestarting(false);
  }, [restartTask, clusterName, connectName, connectorName, task.id?.task]);

  return (
    <tr>
      <td className="has-text-overflow-ellipsis">{task.status?.id}</td>
      <td>{task.status?.workerId}</td>
      <td>
        <StatusTag status={task.status.state} />
      </td>
      <td>{task.status.trace}</td>
      <td>
        <button
          type="button"
          className="button is-small is-pulled-right"
          onClick={restartTaskHandler}
          disabled={restarting}
        >
          <span className="icon">
            <i className="fas fa-sync-alt" />
          </span>
        </button>
      </td>
    </tr>
  );
};

export default ListItem;
