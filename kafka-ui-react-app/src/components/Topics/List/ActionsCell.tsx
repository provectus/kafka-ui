import React from 'react';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import ClusterContext from 'components/contexts/ClusterContext';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import {
  Dropdown,
  DropdownItem,
  DropdownItemHint,
} from 'components/common/Dropdown';
import {
  useDeleteTopic,
  useClearTopicMessages,
  useRecreateTopic,
} from 'lib/hooks/api/topics';

const ActionsCell: React.FC<CellContext<Topic, unknown>> = ({ row }) => {
  const { name, internal, cleanUpPolicy } = row.original;

  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const clearMessage = useClearTopicMessages(clusterName);
  const deleteTopic = useDeleteTopic(clusterName);
  const recreateTopic = useRecreateTopic({ clusterName, topicName: name });

  const disabled = internal || isReadOnly;

  const clearTopicMessagesHandler = async () => {
    await clearMessage.mutateAsync(name);
  };

  const isCleanupDisabled = cleanUpPolicy !== CleanUpPolicy.DELETE;

  return (
    <Dropdown disabled={disabled}>
      <DropdownItem
        disabled={isCleanupDisabled}
        onClick={clearTopicMessagesHandler}
        confirm="Are you sure want to clear topic messages?"
        danger
      >
        Clear Messages
        <DropdownItemHint>
          Clearing messages is only allowed for topics
          <br />
          with DELETE policy
        </DropdownItemHint>
      </DropdownItem>
      <DropdownItem
        onClick={recreateTopic.mutateAsync}
        confirm={
          <>
            Are you sure to recreate <b>{name}</b> topic?
          </>
        }
        danger
      >
        Recreate Topic
      </DropdownItem>
      <DropdownItem
        disabled={!isTopicDeletionAllowed}
        onClick={() => deleteTopic.mutateAsync(name)}
        confirm={
          <>
            Are you sure want to remove <b>{name}</b> topic?
          </>
        }
        danger
      >
        Remove Topic
        {!isTopicDeletionAllowed && (
          <DropdownItemHint>
            The topic deletion is restricted at the application
            <br />
            configuration level
          </DropdownItemHint>
        )}
      </DropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
