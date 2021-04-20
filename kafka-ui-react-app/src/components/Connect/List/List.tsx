import React from 'react';
import { Connect, FullConnectorInfo } from 'generated-sources';
import { useParams } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import ClusterContext from 'components/contexts/ClusterContext';
import Indicator from 'components/common/Dashboard/Indicator';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListItem from './ListItem';

export interface ListProps {
  areConnectsFetching: boolean;
  areConnectorsFetching: boolean;
  connectors: FullConnectorInfo[];
  connects: Connect[];
  fetchConnects(clusterName: ClusterName): void;
  fetchConnectors(clusterName: ClusterName): void;
}

const List: React.FC<ListProps> = ({
  connectors,
  connects,
  areConnectsFetching,
  areConnectorsFetching,
  fetchConnects,
  fetchConnectors,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: string }>();

  React.useEffect(() => {
    fetchConnects(clusterName);
    fetchConnectors(clusterName);
  }, [fetchConnects, fetchConnectors, clusterName]);

  return (
    <div className="section">
      <Breadcrumb>All Connectors</Breadcrumb>
      <article className="message is-warning">
        <div className="message-body">
          Kafka Connect section is under construction.
        </div>
      </article>
      <MetricsWrapper>
        <Indicator
          className="level-left is-one-third"
          label="Connects"
          title="Connects"
          fetching={areConnectsFetching}
        >
          {connects.length}
        </Indicator>

        {!isReadOnly && (
          <div className="level-item level-right">
            <button type="button" className="button is-primary" disabled>
              Create Connector
            </button>
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
    </div>
  );
};

export default List;
