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
import Pagination from 'components/common/Pagination/Pagination';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import {
  GetTopicsRequest,
  SortOrder,
  TopicColumnsToSort,
} from 'generated-sources';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import Search from 'components/common/Search/Search';
import { PER_PAGE } from 'lib/constants';
import { Table } from 'components/common/table/Table/Table.styled';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import Switch from 'components/common/Switch/Switch';

import ListItem from './ListItem';

export interface TopicsListProps {
  areTopicsFetching: boolean;
  topics: TopicWithDetailedInfo[];
  totalPages: number;
  fetchTopicsList(props: GetTopicsRequest): void;
  deleteTopic(topicName: TopicName, clusterName: ClusterName): void;
  deleteTopics(topicName: TopicName, clusterNames: ClusterName[]): void;
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
  clearTopicMessages,
  clearTopicsMessages,
  search,
  orderBy,
  sortOrder,
  setTopicsSearch,
  setTopicsOrderBy,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const { page, perPage, pathname } = usePagination();
  const [showInternal, setShowInternal] = React.useState<boolean>(true);
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

  const [selectedTopics, setSelectedTopics] = React.useState<Set<string>>(
    new Set()
  );

  const clearSelectedTopics = () => {
    setSelectedTopics(new Set());
  };

  const toggleTopicSelected = (topicName: string) => {
    setSelectedTopics((prevState) => {
      const newState = new Set(prevState);
      if (newState.has(topicName)) {
        newState.delete(topicName);
      } else {
        newState.add(topicName);
      }
      return newState;
    });
  };

  const deleteTopicsHandler = React.useCallback(() => {
    deleteTopics(clusterName, Array.from(selectedTopics));
    closeConfirmationModal();
    clearSelectedTopics();
  }, [clusterName, deleteTopics, selectedTopics]);
  const purgeMessagesHandler = React.useCallback(() => {
    clearTopicsMessages(clusterName, Array.from(selectedTopics));
    closeConfirmationModal();
    clearSelectedTopics();
  }, [clearTopicsMessages, clusterName, selectedTopics]);
  const searchHandler = React.useCallback(
    (searchString: string) => {
      setTopicsSearch(searchString);
      history.push(`${pathname}?page=1&perPage=${perPage || PER_PAGE}`);
    },
    [setTopicsSearch, history, pathname, perPage]
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
          {selectedTopics.size > 0 && (
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
          <Table isFullwidth>
            <thead>
              <tr>
                {!isReadOnly && <TableHeaderCell />}
                <TableHeaderCell
                  title="Topic Name"
                  orderValue={TopicColumnsToSort.NAME}
                  orderBy={orderBy}
                  sortOrder={sortOrder}
                  handleOrderBy={setTopicsOrderBy}
                />
                <TableHeaderCell
                  title="Total Partitions"
                  orderValue={TopicColumnsToSort.TOTAL_PARTITIONS}
                  orderBy={orderBy}
                  sortOrder={sortOrder}
                  handleOrderBy={setTopicsOrderBy}
                />
                <TableHeaderCell
                  title="Out of sync replicas"
                  orderValue={TopicColumnsToSort.OUT_OF_SYNC_REPLICAS}
                  orderBy={orderBy}
                  sortOrder={sortOrder}
                  handleOrderBy={setTopicsOrderBy}
                />
                <TableHeaderCell title="Replication Factor" />
                <TableHeaderCell title="Number of messages" />
                <TableHeaderCell
                  title="Size"
                  orderValue={TopicColumnsToSort.SIZE}
                  orderBy={orderBy}
                  sortOrder={sortOrder}
                  handleOrderBy={setTopicsOrderBy}
                />
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <ListItem
                  clusterName={clusterName}
                  key={topic.name}
                  topic={topic}
                  selected={selectedTopics.has(topic.name)}
                  toggleTopicSelected={toggleTopicSelected}
                  deleteTopic={deleteTopic}
                  clearTopicMessages={clearTopicMessages}
                />
              ))}
              {topics.length === 0 && (
                <tr>
                  <td colSpan={10}>No topics found</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default List;
