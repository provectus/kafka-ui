import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { clusterConnectConnectorPath, clusterTopicPath } from 'lib/paths';
import { ClusterName } from 'redux/interfaces';
import { Link, NavLink } from 'react-router-dom';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import getTagColor from 'components/common/Tag/getTagColor';
import useModal from 'lib/hooks/useModal';
import { useDeleteConnector } from 'lib/hooks/api/kafkaConnect';

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
  const { isOpen, setClose, setOpen } = useModal();
  const deleteMutation = useDeleteConnector({
    clusterName,
    connectName: connect,
    connectorName: name,
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setClose();
  };

  const runningTasks = React.useMemo(() => {
    if (!tasksCount) return null;
    return tasksCount - (failedTasksCount || 0);
  }, [tasksCount, failedTasksCount]);

  return (
    <tr>
      <TableKeyLink>
        <NavLink to={clusterConnectConnectorPath(clusterName, connect, name)}>
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
          <Dropdown label={<VerticalElipsisIcon />} right up>
            <DropdownItem onClick={setOpen} danger>
              Remove Connector
            </DropdownItem>
          </Dropdown>
        </div>
        <ConfirmationModal
          isOpen={isOpen}
          onCancel={setClose}
          onConfirm={handleDelete}
        >
          Are you sure want to remove <b>{name}</b> connector?
        </ConfirmationModal>
      </td>
    </tr>
  );
};

export default ListItem;
