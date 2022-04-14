import React from 'react';
import { useHistory } from 'react-router';
import {
  TopicWithDetailedInfo,
  ClusterName,
  TopicName,
} from 'redux/interfaces';
import { useParams } from 'react-router-dom';
import { clusterTopicNewPath } from 'lib/paths';
import usePagination from 'lib/hooks/usePagination';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import {
  CleanUpPolicy,
  GetTopicsRequest,
  SortOrder,
  TopicColumnsToSort,
} from 'generated-sources';
import Search from 'components/common/Search/Search';
import { PER_PAGE } from 'lib/constants';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import Switch from 'components/common/Switch/Switch';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import {
  TableCellProps,
  TableColumn,
} from 'components/common/SmartTable/TableColumn';
import { useTableState } from 'lib/hooks/useTableState';
import Dropdown from 'components/common/Dropdown/Dropdown';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import DropdownItem from 'components/common/Dropdown/DropdownItem';

import {
  MessagesCell,
  OutOfSyncReplicasCell,
  TitleCell,
  TopicSizeCell,
} from './TopicsTableCells';

export interface TopicsListProps {
  areTopicsFetching: boolean;
  topics: TopicWithDetailedInfo[];
  totalPages: number;
  fetchTopicsList(props: GetTopicsRequest): void;
  deleteTopic(topicName: TopicName, clusterName: ClusterName): void;
  deleteTopics(topicName: TopicName, clusterNames: ClusterName[]): void;
  recreateTopic(topicName: TopicName, clusterName: ClusterName): void;
  clearTopicsMessages(topicName: TopicName, clusterNames: ClusterName[]): void;
  clearTopicMessages(
    topicName: TopicName,
    clusterName: ClusterName,
    partitions?: number[]
  ): void;
  search: string;
  orderBy: TopicColumnsToSort | null;
  sortOrder: SortOrder;
  setTopicsSearch(search: string): void;
  setTopicsOrderBy(orderBy: TopicColumnsToSort | null): void;
}

const List: React.FC<TopicsListProps> = ({
  areTopicsFetching,
  topics,
  totalPages,
  fetchTopicsList,
  deleteTopic,
  deleteTopics,
  recreateTopic,
  clearTopicMessages,
  clearTopicsMessages,
  search,
  orderBy,
  sortOrder,
  setTopicsSearch,
  setTopicsOrderBy,
}) => {
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const { page, perPage, pathname } = usePagination();
  const [showInternal, setShowInternal] = React.useState<boolean>(true);
  const [cachedPage, setCachedPage] = React.useState<number | null>(null);
  const history = useHistory();

  React.useEffect(() => {
    fetchTopicsList({
      clusterName,
      page,
      perPage,
      orderBy: orderBy || undefined,
      sortOrder,
      search,
      showInternal,
    });
  }, [
    fetchTopicsList,
    clusterName,
    page,
    perPage,
    orderBy,
    sortOrder,
    search,
    showInternal,
  ]);

  const tableState = useTableState<
    TopicWithDetailedInfo,
    string,
    TopicColumnsToSort
  >(
    topics,
    {
      idSelector: (topic) => topic.name,
      totalPages,
      isRowSelectable: (topic) => !topic.internal,
    },
    {
      handleOrderBy: setTopicsOrderBy,
      orderBy,
      sortOrder,
    }
  );

  const handleSwitch = React.useCallback(() => {
    setShowInternal(!showInternal);
    history.push(`${pathname}?page=1&perPage=${perPage || PER_PAGE}`);
  }, [history, pathname, perPage, showInternal]);

  const [confirmationModal, setConfirmationModal] = React.useState<
    '' | 'deleteTopics' | 'purgeMessages'
  >('');

  const closeConfirmationModal = () => {
    setConfirmationModal('');
  };

  const clearSelectedTopics = React.useCallback(() => {
    tableState.toggleSelection(false);
  }, [tableState]);

  const deleteTopicsHandler = React.useCallback(() => {
    deleteTopics(clusterName, Array.from(tableState.selectedIds));
    closeConfirmationModal();
    clearSelectedTopics();
  }, [clearSelectedTopics, clusterName, deleteTopics, tableState.selectedIds]);
  const purgeMessagesHandler = React.useCallback(() => {
    clearTopicsMessages(clusterName, Array.from(tableState.selectedIds));
    closeConfirmationModal();
    clearSelectedTopics();
  }, [
    clearSelectedTopics,
    clearTopicsMessages,
    clusterName,
    tableState.selectedIds,
  ]);

  const searchHandler = React.useCallback(
    (searchString: string) => {
      setTopicsSearch(searchString);

      setCachedPage(page || null);

      const newPageQuery = !searchString && cachedPage ? cachedPage : 1;

      history.push(
        `${pathname}?page=${newPageQuery}&perPage=${perPage || PER_PAGE}`
      );
    },
    [setTopicsSearch, history, pathname, perPage, page]
  );

  const ActionsCell = React.memo<TableCellProps<TopicWithDetailedInfo, string>>(
    ({ hovered, dataItem: { internal, cleanUpPolicy, name } }) => {
      const [
        isDeleteTopicConfirmationVisible,
        setDeleteTopicConfirmationVisible,
      ] = React.useState(false);

      const [
        isRecreateTopicConfirmationVisible,
        setRecreateTopicConfirmationVisible,
      ] = React.useState(false);

      const deleteTopicHandler = React.useCallback(() => {
        deleteTopic(clusterName, name);
      }, [name]);

      const clearTopicMessagesHandler = React.useCallback(() => {
        clearTopicMessages(clusterName, name);
      }, [name]);

      const recreateTopicHandler = React.useCallback(() => {
        recreateTopic(clusterName, name);
        setRecreateTopicConfirmationVisible(false);
      }, [name]);

      return (
        <>
          {!internal && !isReadOnly && hovered ? (
            <div className="has-text-right">
              <Dropdown label={<VerticalElipsisIcon />} right>
                {cleanUpPolicy === CleanUpPolicy.DELETE && (
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
                <DropdownItem
                  onClick={() => setRecreateTopicConfirmationVisible(true)}
                  danger
                >
                  Recreate Topic
                </DropdownItem>
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
          <ConfirmationModal
            isOpen={isRecreateTopicConfirmationVisible}
            onCancel={() => setRecreateTopicConfirmationVisible(false)}
            onConfirm={recreateTopicHandler}
          >
            Are you sure to recreate <b>{name}</b> topic?
          </ConfirmationModal>
        </>
      );
    }
  );

  return (
    <div>
      <div>
        <PageHeading text="All Topics">
          {!isReadOnly && (
            <Button
              buttonType="primary"
              buttonSize="M"
              isLink
              to={clusterTopicNewPath(clusterName)}
            >
              <i className="fas fa-plus" /> Add a Topic
            </Button>
          )}
        </PageHeading>
        <ControlPanelWrapper hasInput>
          <div>
            <Search
              handleSearch={searchHandler}
              placeholder="Search by Topic Name"
              value={search}
            />
          </div>
          <div>
            <Switch
              name="ShowInternalTopics"
              checked={showInternal}
              onChange={handleSwitch}
            />
            <label>Show Internal Topics</label>
          </div>
        </ControlPanelWrapper>
      </div>
      {areTopicsFetching ? (
        <PageLoader />
      ) : (
        <div>
          {tableState.selectedCount > 0 && (
            <>
              <ControlPanelWrapper data-testid="delete-buttons">
                <Button
                  buttonSize="M"
                  buttonType="secondary"
                  onClick={() => {
                    setConfirmationModal('deleteTopics');
                  }}
                >
                  Delete selected topics
                </Button>
                <Button
                  buttonSize="M"
                  buttonType="secondary"
                  onClick={() => {
                    setConfirmationModal('purgeMessages');
                  }}
                >
                  Purge messages of selected topics
                </Button>
              </ControlPanelWrapper>
              <ConfirmationModal
                isOpen={confirmationModal !== ''}
                onCancel={closeConfirmationModal}
                onConfirm={
                  confirmationModal === 'deleteTopics'
                    ? deleteTopicsHandler
                    : purgeMessagesHandler
                }
              >
                {confirmationModal === 'deleteTopics'
                  ? 'Are you sure you want to remove selected topics?'
                  : 'Are you sure you want to purge messages of selected topics?'}
              </ConfirmationModal>
            </>
          )}
          <SmartTable
            selectable={!isReadOnly}
            tableState={tableState}
            placeholder="No topics found"
            isFullwidth
            paginated
            hoverable
          >
            <TableColumn
              maxWidth="350px"
              title="Topic Name"
              cell={TitleCell}
              orderValue={TopicColumnsToSort.NAME}
            />
            <TableColumn
              title="Total Partitions"
              field="partitions.length"
              orderValue={TopicColumnsToSort.TOTAL_PARTITIONS}
            />
            <TableColumn
              title="Out of sync replicas"
              cell={OutOfSyncReplicasCell}
              orderValue={TopicColumnsToSort.OUT_OF_SYNC_REPLICAS}
            />
            <TableColumn title="Replication Factor" field="replicationFactor" />
            <TableColumn title="Number of messages" cell={MessagesCell} />
            <TableColumn
              title="Size"
              cell={TopicSizeCell}
              orderValue={TopicColumnsToSort.SIZE}
            />
            <TableColumn
              maxWidth="4%"
              className="topic-action-block"
              cell={ActionsCell}
            />
          </SmartTable>
        </div>
      )}
    </div>
  );
};

export default List;
