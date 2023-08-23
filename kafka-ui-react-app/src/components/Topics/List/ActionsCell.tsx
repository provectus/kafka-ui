import React from 'react';
import { Action, CleanUpPolicy, Topic, ResourceType } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import ClusterContext from 'components/contexts/ClusterContext';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { Dropdown, DropdownItemHint } from 'components/common/Dropdown';
import {
  useDeleteTopic,
  useClearTopicMessages,
  useRecreateTopic,
} from 'lib/hooks/api/topics';
import { ActionDropdownItem } from 'components/common/ActionComponent';

const ActionsCell: React.FC<CellContext<Topic, unknown>> = ({ row }) => {
  const { name, internal, cleanUpPolicy } = row.original;

  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const clearMessages = useClearTopicMessages(clusterName);
  const deleteTopic = useDeleteTopic(clusterName);
  const recreateTopic = useRecreateTopic({ clusterName, topicName: name });

  const disabled = internal || isReadOnly;

  const clearTopicMessagesHandler = async () => {
    await clearMessages.mutateAsync(name);
  };

  const isCleanupDisabled = cleanUpPolicy !== CleanUpPolicy.DELETE;

  return (
    <Dropdown disabled={disabled}>
      <ActionDropdownItem
        disabled={isCleanupDisabled}
        onClick={clearTopicMessagesHandler}
        confirm="Are you sure want to clear topic messages?"
        danger
        permission={{
          resource: ResourceType.TOPIC,
          action: Action.MESSAGES_DELETE,
          value: name,
        }}
      >
        Clear Messages
        <DropdownItemHint>
          Clearing messages is only allowed for topics
          <br />
          with DELETE policy
        </DropdownItemHint>
      </ActionDropdownItem>
      <ActionDropdownItem
        disabled={!isTopicDeletionAllowed}
        onClick={recreateTopic.mutateAsync}
        confirm={
          <>
            Are you sure to recreate <b>{name}</b> topic?
          </>
        }
        danger
        permission={{
          resource: ResourceType.TOPIC,
          action: [Action.VIEW, Action.CREATE, Action.DELETE],
          value: name,
        }}
      >
        Recreate Topic
      </ActionDropdownItem>
      <ActionDropdownItem
        disabled={!isTopicDeletionAllowed}
        onClick={() => deleteTopic.mutateAsync(name)}
        confirm={
          <>
            Are you sure want to remove <b>{name}</b> topic?
          </>
        }
        danger
        permission={{
          resource: ResourceType.TOPIC,
          action: Action.DELETE,
          value: name,
        }}
      >
        Remove Topic
        {!isTopicDeletionAllowed && (
          <DropdownItemHint>
            The topic deletion is restricted at the broker
            <br />
            configuration level (delete.topic.enable = false)
          </DropdownItemHint>
        )}
      </ActionDropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
