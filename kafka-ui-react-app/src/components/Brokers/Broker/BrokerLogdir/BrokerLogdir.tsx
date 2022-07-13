import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { translateLogdirs } from 'components/Brokers/utils/translateLogdirs';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import { useTableState } from 'lib/hooks/useTableState';
import { ClusterBrokerParam } from 'lib/paths';
import { useBrokerLogDirs } from 'lib/hooks/api/brokers';

export interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const BrokerLogdir: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();

  const { data: logDirs } = useBrokerLogDirs(clusterName, Number(brokerId));

  const preparedRows = translateLogdirs(logDirs);
  const tableState = useTableState<BrokerLogdirState, string>(preparedRows, {
    idSelector: ({ name }) => name,
    totalPages: 0,
  });

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
