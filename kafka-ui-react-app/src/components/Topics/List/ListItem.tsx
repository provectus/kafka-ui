import React from 'react';
import {
  ClusterName,
  TopicName,
  TopicWithDetailedInfo,
} from 'redux/interfaces';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import Dropdown from 'components/common/Dropdown/Dropdown';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import ClusterContext from 'components/contexts/ClusterContext';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { Tag } from 'components/common/Tag/Tag.styled';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';

import * as S from './List.styled';

export interface ListItemProps {
  topic: TopicWithDetailedInfo;
  selected: boolean;
  toggleTopicSelected(topicName: TopicName): void;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  clusterName: ClusterName;
  clearTopicMessages(topicName: TopicName, clusterName: ClusterName): void;
}

const ListItem: React.FC<ListItemProps> = ({
  topic: {
    name,
    internal,
    partitions,
    segmentSize,
    replicationFactor,
    cleanUpPolicy,
  },
  selected,
  toggleTopicSelected,
  deleteTopic,
  clusterName,
  clearTopicMessages,
}) => {
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);

  const [isDeleteTopicConfirmationVisible, setDeleteTopicConfirmationVisible] =
    React.useState(false);

  const { outOfSyncReplicas, numberOfMessages } = React.useMemo(() => {
    if (partitions === undefined || partitions.length === 0) {
      return {
        outOfSyncReplicas: 0,
        numberOfMessages: 0,
      };
    }

    return partitions.reduce(
      (memo, { replicas, offsetMax, offsetMin }) => {
        const outOfSync = replicas?.filter(({ inSync }) => !inSync);
        return {
          outOfSyncReplicas: memo.outOfSyncReplicas + (outOfSync?.length || 0),
          numberOfMessages: memo.numberOfMessages + (offsetMax - offsetMin),
        };
      },
      {
        outOfSyncReplicas: 0,
        numberOfMessages: 0,
      }
    );
  }, [partitions]);

  const deleteTopicHandler = React.useCallback(() => {
    deleteTopic(clusterName, name);
  }, [clusterName, name]);

  const clearTopicMessagesHandler = React.useCallback(() => {
    clearTopicMessages(clusterName, name);
  }, [clusterName, name]);
  const [vElipsisVisble, setVElipsisVisble] = React.useState(false);

  return (
    <tr
      onMouseEnter={() => setVElipsisVisble(true)}
      onMouseLeave={() => setVElipsisVisble(false)}
    >
      {!isReadOnly && (
        <td>
          {!internal && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => {
                toggleTopicSelected(name);
              }}
            />
          )}
        </td>
      )}
      <TableKeyLink style={{ width: '44%' }}>
        {internal && <Tag color="gray">IN</Tag>}
        <S.Link exact to={`topics/${name}`} $isInternal={internal}>
          {name}
        </S.Link>
      </TableKeyLink>
      <td>{partitions?.length}</td>
      <td>{outOfSyncReplicas}</td>
      <td>{replicationFactor}</td>
      <td>{numberOfMessages}</td>
      <td>
        <BytesFormatted value={segmentSize} />
      </td>
      <td className="topic-action-block" style={{ width: '4%' }}>
        {!internal && !isReadOnly && vElipsisVisble ? (
          <div className="has-text-right">
            <Dropdown label={<VerticalElipsisIcon />} right>
              {cleanUpPolicy === 'DELETE' && (
                <DropdownItem onClick={clearTopicMessagesHandler} danger>
                  Clear Messages
                </DropdownItem>
              )}
              {isTopicDeletionAllowed && (
                <DropdownItem
                  onClick={() => setDeleteTopicConfirmationVisible(true)}
                  danger
                >
                  Remove Topic
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        ) : null}
        <ConfirmationModal
          isOpen={isDeleteTopicConfirmationVisible}
          onCancel={() => setDeleteTopicConfirmationVisible(false)}
          onConfirm={deleteTopicHandler}
        >
          Are you sure want to remove <b>{name}</b> topic?
        </ConfirmationModal>
      </td>
    </tr>
  );
};

export default ListItem;
