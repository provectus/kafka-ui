import React from 'react';
import {
  CleanUpPolicy,
  SortOrder,
  TopicColumnsToSort,
} from 'generated-sources';
import { useAppDispatch } from 'lib/hooks/redux';
import { TableCellProps } from 'components/common/SmartTable/TableColumn';
import { TopicWithDetailedInfo } from 'redux/interfaces';
import ClusterContext from 'components/contexts/ClusterContext';
import * as S from 'components/Topics/List/List.styled';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import {
  deleteTopic,
  fetchTopicsList,
  recreateTopic,
} from 'redux/reducers/topics/topicsSlice';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';

interface TopicsListParams {
  clusterName: string;
  page?: number;
  perPage?: number;
  showInternal?: boolean;
  search?: string;
  orderBy?: TopicColumnsToSort;
  sortOrder?: SortOrder;
}
export interface ActionsCellProps {
  topicsListParams: TopicsListParams;
}

const ActionsCell: React.FC<
  TableCellProps<TopicWithDetailedInfo, string> & ActionsCellProps
> = ({
  hovered,
  dataItem: { internal, cleanUpPolicy, name },
  topicsListParams,
}) => {
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const dispatch = useAppDispatch();
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const isHidden = internal || isReadOnly || !hovered;

  const deleteTopicHandler = () => {
    dispatch(deleteTopic({ clusterName, topicName: name }));
  };

  const clearTopicMessagesHandler = () => {
    dispatch(clearTopicMessages({ clusterName, topicName: name }));
    dispatch(fetchTopicsList(topicsListParams));
  };

  const recreateTopicHandler = () => {
    dispatch(recreateTopic({ clusterName, topicName: name }));
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
            onClick={recreateTopicHandler}
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
              onClick={deleteTopicHandler}
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
