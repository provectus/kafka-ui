import React from 'react';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { useAppDispatch } from 'lib/hooks/redux';
import ClusterContext from 'components/contexts/ClusterContext';
import * as S from 'components/Topics/List/List.styled';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
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

  const isHidden = internal || isReadOnly;

  const clearTopicMessagesHandler = async () => {
    await dispatch(
      clearTopicMessages({ clusterName, topicName: name })
    ).unwrap();
    queryClient.invalidateQueries(topicKeys.all(clusterName));
  };

  return (
    <S.ActionsContainer>
      <Dropdown disabled={isHidden}>
        {cleanUpPolicy === CleanUpPolicy.DELETE && (
          <DropdownItem
            onClick={clearTopicMessagesHandler}
            confirm="Are you sure want to clear topic messages?"
            danger
          >
            Clear Messages
          </DropdownItem>
        )}
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
        {isTopicDeletionAllowed && (
          <DropdownItem
            onClick={() => deleteTopic.mutateAsync(name)}
            confirm={
              <>
                Are you sure want to remove <b>{name}</b> topic?
              </>
            }
            danger
          >
            Remove Topic
          </DropdownItem>
        )}
      </Dropdown>
    </S.ActionsContainer>
  );
};

export default React.memo(ActionsCell);
