import React from 'react';
import cx from 'classnames';
import { FullConnectorInfo } from 'generated-sources';
import { clusterConnectConnectorPath, clusterTopicPath } from 'lib/paths';
import { ClusterName } from 'redux/interfaces';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteConnector } from 'redux/actions';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownDivider from 'components/common/Dropdown/DropdownDivider';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import ConnectorStatusTag from 'components/Connect/ConnectorStatusTag';

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
  const [
    isDeleteConnectorConfirmationVisible,
    setDeleteConnectorConfirmationVisible,
  ] = React.useState(false);

  const handleDelete = React.useCallback(() => {
    if (clusterName && connect && name) {
      dispatch(deleteConnector(clusterName, connect, name));
    }
    setDeleteConnectorConfirmationVisible(false);
  }, [clusterName, connect, name]);

  const runningTasks = React.useMemo(() => {
    if (!tasksCount) return null;
    return tasksCount - (failedTasksCount || 0);
  }, [tasksCount, failedTasksCount]);

  return (
    <tr>
      <td className="has-text-overflow-ellipsis">
        <NavLink
          exact
          to={clusterConnectConnectorPath(clusterName, connect, name)}
          activeClassName="is-active"
          className="title is-6"
        >
          {name}
        </NavLink>
      </td>
      <td>{connect}</td>
      <td>{type}</td>
      <td>{connectorClass}</td>
      <td>
        <div className="is-flex is-flex-wrap-wrap">
          {topics?.map((t) => (
            <span key={t} className="tag is-info is-light mr-1 mb-1">
              <Link to={clusterTopicPath(clusterName, t)}>{t}</Link>
            </span>
          ))}
        </div>
      </td>
      <td>{status && <ConnectorStatusTag status={status.state} />}</td>
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
      <td>
        <div className="has-text-right">
          <Dropdown
            label={
              <span className="icon">
                <i className="fas fa-cog" />
              </span>
            }
            right
          >
            <DropdownDivider />
            <DropdownItem
              onClick={() => setDeleteConnectorConfirmationVisible(true)}
            >
              <span className="has-text-danger">Remove Connector</span>
            </DropdownItem>
          </Dropdown>
        </div>
        <ConfirmationModal
          isOpen={isDeleteConnectorConfirmationVisible}
          onCancel={() => setDeleteConnectorConfirmationVisible(false)}
          onConfirm={handleDelete}
        >
          Are you sure want to remove <b>{name}</b> connector?
        </ConfirmationModal>
      </td>
    </tr>
  );
};

export default ListItem;
