import React from 'react';
import { TopicAnalysisStats } from 'generated-sources';
import { ColumnDef } from '@tanstack/react-table';
import Table from 'components/common/NewTable';

import PartitionInfoRow from './PartitionInfoRow';

const PartitionTable: React.FC<{ data: TopicAnalysisStats[] }> = ({ data }) => {
  const columns = React.useMemo<ColumnDef<TopicAnalysisStats>[]>(
    () => [
      {
        header: 'Partition ID',
        accessorKey: 'partition',
      },
      {
        header: 'Total Messages',
        accessorKey: 'totalMsgs',
      },
      {
        header: 'Min Offset',
        accessorKey: 'minOffset',
      },
      { header: 'Max Offset', accessorKey: 'maxOffset' },
    ],
    []
  );

  return (
    <Table
      data={data}
      columns={columns}
      getRowCanExpand={() => true}
      renderSubComponent={PartitionInfoRow}
      enableSorting
    />
  );
};

export default PartitionTable;
