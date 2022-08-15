import React from 'react';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { useAppDispatch } from 'lib/hooks/redux';
import ClusterContext from 'components/contexts/ClusterContext';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  Dropdown,
  DropdownItem,
  DropdownItemHint,
} from 'components/common/Dropdown';
import { useQueryClient } from '@tanstack/react-query';
import {
  topicKeys,
  useDeleteTopic,
  useRecreateTopic,
} from 'lib/hooks/api/topics';

const ActionsCell: React.FC<CellContext<Topic, unknown>> = ({ row }) => {
  const { name, internal, cleanUpPolicy } = row.original;

  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const dispatch = useAppDispatch();
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const queryClient = useQueryClient();

  const deleteTopic = useDeleteTopic(clusterName);
  const recreateTopic = useRecreateTopic({ clusterName, topicName: name });

  const disabled = internal || isReadOnly;

  const clearTopicMessagesHandler = async () => {
    await dispatch(
      clearTopicMessages({ clusterName, topicName: name })
    ).unwrap();
    queryClient.invalidateQueries(topicKeys.all(clusterName));
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
