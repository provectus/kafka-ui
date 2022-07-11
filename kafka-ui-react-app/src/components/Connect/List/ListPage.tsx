import React, { Suspense } from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { clusterConnectorNewRelativePath, ClusterNameRoute } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import Search from 'components/common/Search/Search';
import * as Metrics from 'components/common/Metrics';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import useSearch from 'lib/hooks/useSearch';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ConnectorState } from 'generated-sources';
import { useConnectors } from 'lib/hooks/api/kafkaConnect';

import List from './List';

const ListPage: React.FC = () => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const [search, handleSearch] = useSearch();

  // Fetches all connectors from the API, without search criteria. Used to display general metrics.
  const { data: connectorsMetrics, isLoading } = useConnectors(clusterName);

  const numberOfFailedConnectors = connectorsMetrics?.filter(
    ({ status: { state } }) => state === ConnectorState.FAILED
  ).length;

  const numberOfFailedTasks = connectorsMetrics?.reduce(
    (acc, metric) => acc + (metric.failedTasksCount ?? 0),
    0
  );

  return (
    <>
      <PageHeading text="Connectors">
        {!isReadOnly && (
          <Button
            buttonType="primary"
            buttonSize="M"
            to={clusterConnectorNewRelativePath}
          >
            Create Connector
          </Button>
        )}
      </PageHeading>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator
            label="Connectors"
            title="Total number of connectors"
            fetching={isLoading}
          >
            {connectorsMetrics?.length || '-'}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="Failed Connectors"
            title="Number of failed connectors"
            fetching={isLoading}
          >
            {numberOfFailedConnectors ?? '-'}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="Failed Tasks"
            title="Number of failed tasks"
            fetching={isLoading}
          >
            {numberOfFailedTasks ?? '-'}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <ControlPanelWrapper hasInput>
        <Search
          handleSearch={handleSearch}
          placeholder="Search by Connect Name, Status or Type"
          value={search}
        />
      </ControlPanelWrapper>
      <Suspense fallback={<PageLoader />}>
        <List />
      </Suspense>
    </>
  );
};

export default ListPage;
