import React from 'react';
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
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import getTagColor from 'components/Connect/Utils/TagColor';

import * as S from './List.styled';

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
  }, [clusterName, connect, dispatch, name]);

  const runningTasks = React.useMemo(() => {
    if (!tasksCount) return null;
    return tasksCount - (failedTasksCount || 0);
  }, [tasksCount, failedTasksCount]);

  return (
    <tr>
      <TableKeyLink>
        <NavLink
          exact
          to={clusterConnectConnectorPath(clusterName, connect, name)}
        >
          {name}
        </NavLink>
      </TableKeyLink>
      <td>{connect}</td>
      <td>{type}</td>
      <td>{connectorClass}</td>
      <td>
        <S.TagsWrapper>
          {topics?.map((t) => (
            <Tag key={t} color="gray">
              <Link to={clusterTopicPath(clusterName, t)}>{t}</Link>
            </Tag>
          ))}
        </S.TagsWrapper>
      </td>
      <td>{status && <Tag color={getTagColor(status)}>{status.state}</Tag>}</td>
      <td>
        {runningTasks && (
          <span>
            {runningTasks} of {tasksCount}
          </span>
        )}
      </td>
      <td>
        <div>
          <Dropdown label={<VerticalElipsisIcon />} right>
            <DropdownDivider />
            <DropdownItem
              onClick={() => setDeleteConnectorConfirmationVisible(true)}
              danger
            >
              Remove Connector
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
