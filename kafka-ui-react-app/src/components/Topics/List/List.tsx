import React from 'react';
import { useHistory } from 'react-router';
import {
  TopicWithDetailedInfo,
  ClusterName,
  TopicName,
} from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { Link, useParams } from 'react-router-dom';
import { clusterTopicNewPath } from 'lib/paths';
import usePagination from 'lib/hooks/usePagination';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Pagination from 'components/common/Pagination/Pagination';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { GetTopicsRequest, TopicColumnsToSort } from 'generated-sources';
import SortableColumnHeader from 'components/common/table/SortableCulumnHeader/SortableColumnHeader';
import Search from 'components/common/Search/Search';
import { PER_PAGE } from 'lib/constants';

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
      search,
      showInternal,
    });
  }, [
    fetchTopicsList,
    clusterName,
    page,
    perPage,
    orderBy,
    search,
    showInternal,
  ]);

  const handleSwitch = React.useCallback(() => {
    setShowInternal(!showInternal);
    history.push(`${pathname}?page=1&perPage=${perPage || PER_PAGE}`);
  }, [showInternal]);

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
  }, [clusterName, selectedTopics]);
  const purgeMessagesHandler = React.useCallback(() => {
    clearTopicsMessages(clusterName, Array.from(selectedTopics));
    closeConfirmationModal();
    clearSelectedTopics();
  }, [clusterName, selectedTopics]);

  return (
    <div className="section">
      <Breadcrumb>{showInternal ? `All Topics` : `External Topics`}</Breadcrumb>
      <div className="box">
        <div className="columns">
          <div className="column is-one-quarter is-align-items-center is-flex">
            <div className="field">
              <input
                id="switchRoundedDefault"
                type="checkbox"
                name="switchRoundedDefault"
                className="switch is-rounded"
                checked={showInternal}
                onChange={handleSwitch}
              />
              <label htmlFor="switchRoundedDefault">Show Internal Topics</label>
            </div>
          </div>
          <div className="column">
            <Search
              handleSearch={setTopicsSearch}
              placeholder="Search by Topic Name"
              value={search}
            />
          </div>
          <div className="column is-2 is-justify-content-flex-end is-flex">
            {!isReadOnly && (
              <Link
                className="button is-primary"
                to={clusterTopicNewPath(clusterName)}
              >
                Add a Topic
              </Link>
            )}
          </div>
        </div>
      </div>
      {areTopicsFetching ? (
        <PageLoader />
      ) : (
        <div className="box">
          {selectedTopics.size > 0 && (
            <>
              <div className="buttons">
                <button
                  type="button"
                  className="button is-danger"
                  onClick={() => {
                    setConfirmationModal('deleteTopics');
                  }}
                >
                  Delete selected topics
                </button>
                <button
                  type="button"
                  className="button is-danger"
                  onClick={() => {
                    setConfirmationModal('purgeMessages');
                  }}
                >
                  Purge messages of selected topics
                </button>
              </div>
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
                  ? 'Are you sure want to remove selected topics?'
                  : 'Are you sure want to purge messages of selected topics?'}
              </ConfirmationModal>
            </>
          )}
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th> </th>
                <SortableColumnHeader
                  value={TopicColumnsToSort.NAME}
                  title="Topic Name"
                  orderBy={orderBy}
                  setOrderBy={setTopicsOrderBy}
                />
                <SortableColumnHeader
                  value={TopicColumnsToSort.TOTAL_PARTITIONS}
                  title="Total Partitions"
                  orderBy={orderBy}
                  setOrderBy={setTopicsOrderBy}
                />
                <SortableColumnHeader
                  value={TopicColumnsToSort.OUT_OF_SYNC_REPLICAS}
                  title="Out of sync replicas"
                  orderBy={orderBy}
                  setOrderBy={setTopicsOrderBy}
                />
                <th>Replication Factor</th>
                <th>Number of messages</th>
                <th>Size</th>
                <th>Type</th>
                <th>Clean Up Policy</th>
                <th> </th>
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
          </table>
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default List;
