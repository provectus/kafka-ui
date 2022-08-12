import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterBrokerParam } from 'lib/paths';
import { useBrokerLogDirs } from 'lib/hooks/api/brokers';
import Table from 'components/common/NewTable';
import { ColumnDef } from '@tanstack/react-table';
import { BrokersLogdirs } from 'generated-sources';

const BrokerLogdir: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();
  const { data } = useBrokerLogDirs(clusterName, Number(brokerId));

  const columns = React.useMemo<ColumnDef<BrokersLogdirs>[]>(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Error', accessorKey: 'error' },
      {
        header: 'Topics',
        accessorKey: 'topics',
        cell: ({ getValue }) =>
          getValue<BrokersLogdirs['topics']>()?.length || 0,
        enableSorting: false,
      },
      {
        id: 'partitions',
        header: 'Partitions',
        accessorKey: 'topics',
        cell: ({ getValue }) => {
          const topics = getValue<BrokersLogdirs['topics']>();
          if (!topics) {
            return 0;
          }
          return topics.reduce(
            (acc, topic) => acc + (topic.partitions?.length || 0),
            0
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  return (
    <Table
      data={data || []}
      columns={columns}
      emptyMessage="Log dir data not available"
      enableSorting
    />
  );
};

export default BrokerLogdir;
