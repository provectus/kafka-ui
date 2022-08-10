import React from 'react';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { useAppDispatch } from 'lib/hooks/redux';
import { TableCellProps } from 'components/common/SmartTable/TableColumn';
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

const ActionsCell: React.FC<TableCellProps<Topic, string>> = ({
  hovered,
  dataItem: { internal, cleanUpPolicy, name },
}) => {
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const dispatch = useAppDispatch();
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const queryClient = useQueryClient();

  const deleteTopic = useDeleteTopic(clusterName);
  const recreateTopic = useRecreateTopic({ clusterName, topicName: name });

  const isHidden = internal || isReadOnly || !hovered;

  const clearTopicMessagesHandler = async () => {
    await dispatch(
      clearTopicMessages({ clusterName, topicName: name })
    ).unwrap();
    queryClient.invalidateQueries(topicKeys.all(clusterName));
  };

  return (
    <S.ActionsContainer>
      {!isHidden && (
        <Dropdown>
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
      )}
    </S.ActionsContainer>
  );
};

export default React.memo(ActionsCell);
