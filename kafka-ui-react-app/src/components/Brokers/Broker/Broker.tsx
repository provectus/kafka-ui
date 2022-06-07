import React from 'react';
import { useQuery } from 'react-query';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import useAppParams from 'lib/hooks/useAppParams';
import { translateLogdir } from 'components/Brokers/utils/translateLogdir';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import { useTableState } from 'lib/hooks/useTableState';
import { ClusterBrokerParam } from 'lib/paths';
import { brokersApiClient, clustersApiClient } from 'lib/api';

export interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const Broker: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();

  const { data: clusterStats } = useQuery(
    ['clusterStats', clusterName],
    () => clustersApiClient.getClusterStats({ clusterName }),
    { suspense: true, refetchInterval: 5000 }
  );
  const { data: brokers } = useQuery(
    ['brokers', clusterName],
    () => brokersApiClient.getBrokers({ clusterName }),
    { suspense: true, refetchInterval: 5000 }
  );
  const { data: logDirs } = useQuery(
    ['brokerLogDirs', clusterName, brokerId],
    () =>
      brokersApiClient.getAllBrokersLogdirs({
        clusterName,
        broker: [Number(brokerId)],
      }),
    { suspense: true, refetchInterval: 5000 }
  );

  const preparedRows = logDirs?.map(translateLogdir) || [];
  const tableState = useTableState<BrokerLogdirState, string>(preparedRows, {
    idSelector: ({ name }) => name,
    totalPages: 0,
  });

  if (!clusterStats) return null;

  const brokerItem = brokers?.find(({ id }) => id === Number(brokerId));
  const brokerDiskUsage = clusterStats.diskUsage?.find(
    (item) => item.brokerId === Number(brokerId)
  );
  return (
    <>
      <PageHeading text={`Broker ${brokerId}`} />
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Segment Size">
            <BytesFormatted value={brokerDiskUsage?.segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {brokerDiskUsage?.segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Port">{brokerItem?.port}</Metrics.Indicator>
          <Metrics.Indicator label="Host">{brokerItem?.host}</Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <SmartTable
        tableState={tableState}
        placeholder="Log dir data not available"
        isFullwidth
      >
        <TableColumn title="Name" field="name" />
        <TableColumn title="Error" field="error" />
        <TableColumn title="Topics" field="topics" />
        <TableColumn title="Partitions" field="partitions" />
      </SmartTable>
    </>
  );
};

export default Broker;
