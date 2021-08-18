import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Connect, FullConnectorInfo } from 'generated-sources';
import { ClusterName, ConnectorSearch } from 'redux/interfaces';
import { clusterConnectorNewPath } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import Indicator from 'components/common/Dashboard/Indicator';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Search from 'components/common/Search/Search';

import ListItem from './ListItem';

export interface ListProps {
  areConnectsFetching: boolean;
  areConnectorsFetching: boolean;
  connectors: FullConnectorInfo[];
  connects: Connect[];
  fetchConnects(clusterName: ClusterName): void;
  fetchConnectors(clusterName: ClusterName): void;
  search: string;
  setConnectorSearch(value: ConnectorSearch): void;
}

const List: React.FC<ListProps> = ({
  connectors,
  connects,
  areConnectsFetching,
  areConnectorsFetching,
  fetchConnects,
  fetchConnectors,
  search,
  setConnectorSearch,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: string }>();

  React.useEffect(() => {
    fetchConnects(clusterName);
    fetchConnectors(clusterName);
  }, [fetchConnects, fetchConnectors, clusterName]);

  const handleSearch = (value: string) =>
    setConnectorSearch({
      clusterName,
      search: value,
    });

  return (
    <>
      <MetricsWrapper>
        <Indicator
          className="level-left is-one-third"
          label="Connects"
          title="Connects"
          fetching={areConnectsFetching}
        >
          {connects.length}
        </Indicator>

        <div className="column">
          <Search
            handleSearch={handleSearch}
            placeholder="Search by Connect Name, Status or Type"
            value={search}
          />
        </div>

        {!isReadOnly && (
          <div className="level-item level-right">
            <Link
              className="button is-primary"
              to={clusterConnectorNewPath(clusterName)}
            >
              Create Connector
            </Link>
          </div>
        )}
      </MetricsWrapper>
      {areConnectorsFetching ? (
        <PageLoader />
      ) : (
        <div className="box">
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Name</th>
                <th>Connect</th>
                <th>Type</th>
                <th>Plugin</th>
                <th>Topics</th>
                <th>Status</th>
                <th>Running Tasks</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              {connectors.length === 0 && (
                <tr>
                  <td colSpan={10}>No connectors found</td>
                </tr>
              )}
              {connectors.map((connector) => (
                <ListItem
                  key={[connector.name, connector.connect, clusterName].join(
                    '-'
                  )}
                  connector={connector}
                  clusterName={clusterName}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default List;
