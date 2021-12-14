import React from 'react';
import { useParams } from 'react-router-dom';
import { Connect, FullConnectorInfo } from 'generated-sources';
import { ClusterName, ConnectorSearch } from 'redux/interfaces';
import { clusterConnectorNewPath } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import Indicator from 'components/common/Metrics/Indicator';
import MetricsSection from 'components/common/Metrics/MetricsSection';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Search from 'components/common/Search/Search';
import { StyledMetricsWrapper } from 'components/common/Metrics/Metrics.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';

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
      <PageHeading text="Connectors">
        {!isReadOnly && (
          <Button
            isLink
            buttonType="primary"
            buttonSize="M"
            to={clusterConnectorNewPath(clusterName)}
          >
            Create Connector
          </Button>
        )}
      </PageHeading>
      <StyledMetricsWrapper>
        <MetricsSection>
          <Indicator
            label="Connects"
            title="Connects"
            fetching={areConnectsFetching}
          >
            {connectors.length}
          </Indicator>
        </MetricsSection>
      </StyledMetricsWrapper>
      <ControlPanelWrapper hasInput>
        <Search
          handleSearch={handleSearch}
          placeholder="Search by Connect Name, Status or Type"
          value={search}
        />
      </ControlPanelWrapper>
      {areConnectorsFetching ? (
        <PageLoader />
      ) : (
        <div>
          <Table isFullwidth>
            <thead>
              <tr>
                <TableHeaderCell title="Name" />
                <TableHeaderCell title="Connect" />
                <TableHeaderCell title="Type" />
                <TableHeaderCell title="Plugin" />
                <TableHeaderCell title="Topics" />
                <TableHeaderCell title="Status" />
                <TableHeaderCell title="Running Tasks" />
                <TableHeaderCell> </TableHeaderCell>
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
          </Table>
        </div>
      )}
    </>
  );
};

export default List;
