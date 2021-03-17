import React from 'react';
import { TopicWithDetailedInfo, ClusterName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { Link, useParams } from 'react-router-dom';
import { clusterTopicNewPath } from 'lib/paths';
import usePagination from 'lib/hooks/usePagination';
import { FetchTopicsListParams } from 'redux/actions';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Pagination from 'components/common/Pagination/Pagination';
import ListItemContainer from './ListItemContainer';

interface Props {
  areTopicsFetching: boolean;
  topics: TopicWithDetailedInfo[];
  externalTopics: TopicWithDetailedInfo[];
  totalPages: number;
  fetchTopicsList(props: FetchTopicsListParams): void;
}

const List: React.FC<Props> = ({
  areTopicsFetching,
  topics,
  externalTopics,
  totalPages,
  fetchTopicsList,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const { page, perPage } = usePagination();

  React.useEffect(() => {
    fetchTopicsList({ clusterName, page, perPage });
  }, [fetchTopicsList, clusterName, page, perPage]);

  const [showInternal, setShowInternal] = React.useState<boolean>(true);

  const handleSwitch = React.useCallback(() => {
    setShowInternal(!showInternal);
  }, [showInternal]);

  const items = showInternal ? topics : externalTopics;

  return (
    <div className="section">
      <Breadcrumb>{showInternal ? `All Topics` : `External Topics`}</Breadcrumb>
      <div className="box">
        <div className="level">
          <div className="level-item level-left">
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
          <div className="level-item level-right">
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
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th>Total Partitions</th>
                <th>Out of sync replicas</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((topic) => (
                  <ListItemContainer key={topic.name} topic={topic} />
                ))
              ) : (
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
