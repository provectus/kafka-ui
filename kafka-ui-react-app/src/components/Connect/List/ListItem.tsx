import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { clusterConnectConnectorPath, clusterTopicPath } from 'lib/paths';
import { ClusterName } from 'redux/interfaces';
import { Link, NavLink } from 'react-router-dom';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import getTagColor from 'components/common/Tag/getTagColor';
import { useDeleteConnector } from 'lib/hooks/api/kafkaConnect';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { useConfirm } from 'lib/hooks/useConfirm';

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
  const confirm = useConfirm();
  const deleteMutation = useDeleteConnector({
    clusterName,
    connectName: connect,
    connectorName: name,
  });

  const handleDelete = () => {
    confirm(
      <>
        Are you sure want to remove <b>{name}</b> connector?
      </>,
      async () => {
        await deleteMutation.mutateAsync();
      }
    );
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
          <Dropdown>
            <DropdownItem onClick={handleDelete} danger>
              Remove Connector
            </DropdownItem>
          </Dropdown>
        </div>
      </td>
    </tr>
  );
};

export default ListItem;
