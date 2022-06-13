import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { translateLogdir } from 'components/Brokers/utils/translateLogdir';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import { useTableState } from 'lib/hooks/useTableState';
import { ClusterBrokerParam } from 'lib/paths';
import useClusterStats from 'lib/hooks/useClusterStats';
import useBrokersLogDirs from 'lib/hooks/useBrokersLogDirs';

export interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const BrokerLogdir: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();

  const { data: clusterStats } = useClusterStats(clusterName);
  const { data: logDirs } = useBrokersLogDirs(clusterName, Number(brokerId));

  const preparedRows = logDirs?.map(translateLogdir) || [];
  const tableState = useTableState<BrokerLogdirState, string>(preparedRows, {
    idSelector: ({ name }) => name,
    totalPages: 0,
  });

  if (!clusterStats) return null;

  return (
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
  );
};

export default BrokerLogdir;
