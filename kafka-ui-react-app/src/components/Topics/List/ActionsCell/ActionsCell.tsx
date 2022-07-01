import React from 'react';
import { useDispatch } from 'react-redux';
import {
  CleanUpPolicy,
  SortOrder,
  TopicColumnsToSort,
} from 'generated-sources';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import { TableCellProps } from 'components/common/SmartTable/TableColumn';
import { TopicWithDetailedInfo } from 'redux/interfaces';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import Dropdown from 'components/common/Dropdown/Dropdown';
import ClusterContext from 'components/contexts/ClusterContext';
import * as S from 'components/Topics/List/List.styled';
import { ClusterNameRoute } from 'lib/paths';
import useModal from 'lib/hooks/useModal';
import useAppParams from 'lib/hooks/useAppParams';
import usePagination from 'lib/hooks/usePagination';
import {
  deleteTopic,
  fetchTopicsList,
  recreateTopic,
} from 'redux/reducers/topics/topicsSlice';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';

export interface ActionsCellProps {
  search: string;
  orderBy: string | null;
  sortOrder: SortOrder;
}

const ActionsCell: React.FC<
  TableCellProps<TopicWithDetailedInfo, string> & ActionsCellProps
> = ({
  hovered,
  dataItem: { internal, cleanUpPolicy, name },
  search,
  orderBy,
  sortOrder,
}) => {
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const dispatch = useDispatch();

  const { clusterName } = useAppParams<ClusterNameRoute>();
  const { page, perPage } = usePagination();
  const [showInternal, setShowInternal] = React.useState<boolean>(
    !localStorage.getItem('hideInternalTopics') && true
  );
  const topicsListParams = React.useMemo(
    () => ({
      clusterName,
      page,
      perPage,
      orderBy: (orderBy as TopicColumnsToSort) || undefined,
      sortOrder,
      search,
      showInternal,
    }),
    [clusterName, page, perPage, orderBy, sortOrder, search, showInternal]
  );
  const {
    isOpen: isDeleteTopicModalOpen,
    setClose: closeDeleteTopicModal,
    setOpen: openDeleteTopicModal,
  } = useModal(false);

  const {
    isOpen: isRecreateTopicModalOpen,
    setClose: closeRecreateTopicModal,
    setOpen: openRecreateTopicModal,
  } = useModal(false);

  const {
    isOpen: isClearMessagesModalOpen,
    setClose: closeClearMessagesModal,
    setOpen: openClearMessagesModal,
  } = useModal(false);

  const isHidden = internal || isReadOnly || !hovered;

  const deleteTopicHandler = () =>
    dispatch(deleteTopic({ clusterName, topicName: name }));

  const clearTopicMessagesHandler = () => {
    dispatch(clearTopicMessages({ clusterName, topicName: name }));
    dispatch(fetchTopicsList(topicsListParams));
    closeClearMessagesModal();
  };

  const recreateTopicHandler = () => {
    dispatch(recreateTopic({ clusterName, topicName: name }));
    closeRecreateTopicModal();
  };

  return (
    <>
      <S.ActionsContainer>
        {!isHidden && (
          <Dropdown label={<VerticalElipsisIcon />} right>
            {cleanUpPolicy === CleanUpPolicy.DELETE && (
              <DropdownItem onClick={openClearMessagesModal} danger>
                Clear Messages
              </DropdownItem>
            )}
            {isTopicDeletionAllowed && (
              <DropdownItem onClick={openDeleteTopicModal} danger>
                Remove Topic
              </DropdownItem>
            )}
            <DropdownItem onClick={openRecreateTopicModal} danger>
              Recreate Topic
            </DropdownItem>
          </Dropdown>
        )}
      </S.ActionsContainer>
      <ConfirmationModal
        isOpen={isClearMessagesModalOpen}
        onCancel={closeClearMessagesModal}
        onConfirm={clearTopicMessagesHandler}
      >
        Are you sure want to clear topic messages?
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isDeleteTopicModalOpen}
        onCancel={closeDeleteTopicModal}
        onConfirm={deleteTopicHandler}
      >
        Are you sure want to remove <b>{name}</b> topic?
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isRecreateTopicModalOpen}
        onCancel={closeRecreateTopicModal}
        onConfirm={recreateTopicHandler}
      >
        Are you sure to recreate <b>{name}</b> topic?
      </ConfirmationModal>
    </>
  );
};

export default React.memo(ActionsCell);
