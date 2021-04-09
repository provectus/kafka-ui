import React from 'react';
import { Connect, Connector } from 'generated-sources';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import ClusterContext from 'components/contexts/ClusterContext';
import { useParams } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces';
import Indicator from 'components/common/Dashboard/Indicator';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import PageLoader from 'components/common/PageLoader/PageLoader';

export interface ListProps {
  areConnectsFetching: boolean;
  areConnectorsFetching: boolean;
  connectors: Connector[];
  connects: Connect[];
  fetchConnects(clusterName: ClusterName): void;
}

const List: React.FC<ListProps> = ({
  connectors,
  connects,
  areConnectsFetching,
  areConnectorsFetching,
  fetchConnects,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: string }>();

  React.useEffect(() => {
    fetchConnects(clusterName);
  }, [fetchConnects, clusterName]);

  return (
    <div className="section">
      <Breadcrumb>All Connectors</Breadcrumb>
      <div className="box has-background-danger has-text-centered has-text-light">
        Kafka Connect section is under construction.
      </div>
      <MetricsWrapper>
        <Indicator
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
          <div className="table-container">
            <table className="table is-fullwidth">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Connect</th>
                  <th>Type</th>
                  <th>Plugin</th>
                  <th>Topics</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {connectors.length === 0 && (
                  <tr>
                    <td colSpan={10}>No connectors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
