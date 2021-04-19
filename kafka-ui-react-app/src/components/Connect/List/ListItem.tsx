import React from 'react';
import cx from 'classnames';
import { FullConnectorInfo } from 'generated-sources';
import { clusterTopicPath } from 'lib/paths';
import { ClusterName } from 'redux/interfaces';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteConnector } from 'redux/actions';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownDivider from 'components/common/Dropdown/DropdownDivider';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import StatusTag from '../StatusTag';

export interface ListItemProps {
  clusterName: ClusterName;
  connector: FullConnectorInfo;
}

const ListItem: React.FC<ListItemProps> = ({
  clusterName,
  connector: {
    name,
    connect,
    type,
    connectorClass,
    topics,
    status,
    tasksCount,
    failedTasksCount,
  },
}) => {
  const dispatch = useDispatch();

  const handleDelete = React.useCallback(() => {
    if (clusterName && connect && name) {
      dispatch(deleteConnector(clusterName, connect, name));
    }
  }, [clusterName, connect, name]);

  const runningTasks = React.useMemo(() => {
    if (!tasksCount) return null;
    return tasksCount - (failedTasksCount || 0);
  }, [tasksCount, failedTasksCount]);

  return (
    <tr>
      <td className="has-text-overflow-ellipsis">{name}</td>
      <td>{connect}</td>
      <td>{type}</td>
      <td>{connectorClass}</td>
      <td>
        {topics?.map((t) => (
          <Link className="mr-1" key={t} to={clusterTopicPath(clusterName, t)}>
            {t}
          </Link>
        ))}
      </td>
      <td>{status && <StatusTag status={status} />}</td>
      <td>
        {runningTasks && (
          <span
            className={cx(
              failedTasksCount ? 'has-text-danger' : 'has-text-success'
            )}
          >
            {runningTasks} of {tasksCount}
          </span>
        )}
      </td>
      <td className="has-text-right">
        <Dropdown
          label={
            <span className="icon">
              <i className="fas fa-cog" />
            </span>
          }
          right
        >
          <DropdownDivider />
          <DropdownItem onClick={handleDelete}>
            <span className="has-text-danger">Remove Connector</span>
          </DropdownItem>
        </Dropdown>
      </td>
    </tr>
  );
};

export default ListItem;
