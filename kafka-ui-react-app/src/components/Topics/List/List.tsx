import React from 'react';
import {
  TopicWithDetailedInfo,
  ClusterName,
  TopicName,
} from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { Link, useParams } from 'react-router-dom';
import { clusterTopicNewPath } from 'lib/paths';
import usePagination from 'lib/hooks/usePagination';
import { FetchTopicsListParams } from 'redux/actions';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Pagination from 'components/common/Pagination/Pagination';
import { TopicColumnsToSort } from 'generated-sources';
import SortableColumnHeader from 'components/common/table/SortableCulumnHeader/SortableColumnHeader';
import Search from 'components/common/Search/Search';

import ListItem from './ListItem';

interface Props {
  areTopicsFetching: boolean;
  topics: TopicWithDetailedInfo[];
  externalTopics: TopicWithDetailedInfo[];
  totalPages: number;
  fetchTopicsList(props: FetchTopicsListParams): void;
  deleteTopic(topicName: TopicName, clusterName: ClusterName): void;
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

const List: React.FC<Props> = ({
  areTopicsFetching,
  topics,
  externalTopics,
  totalPages,
  fetchTopicsList,
  deleteTopic,
  clearTopicMessages,
  search,
  orderBy,
  setTopicsSearch,
  setTopicsOrderBy,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const { page, perPage } = usePagination();

  React.useEffect(() => {
    fetchTopicsList({
      clusterName,
      page,
      perPage,
      orderBy: orderBy || undefined,
      search,
    });
  }, [fetchTopicsList, clusterName, page, perPage, orderBy, search]);

  const [showInternal, setShowInternal] = React.useState<boolean>(true);

  const handleSwitch = React.useCallback(() => {
    setShowInternal(!showInternal);
  }, [showInternal]);

  const handleSearch = (value: string) => setTopicsSearch(value);

  const items = showInternal ? topics : externalTopics;

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
              handleSearch={handleSearch}
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
          <table className="table is-fullwidth">
            <thead>
              <tr>
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
                <th>Number of messages</th>
                <th>Size</th>
                <th>Type</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {items.map((topic) => (
                <ListItem
                  clusterName={clusterName}
                  key={topic.name}
                  topic={topic}
                  deleteTopic={deleteTopic}
                  clearTopicMessages={clearTopicMessages}
                />
              ))}
              {items.length === 0 && (
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
