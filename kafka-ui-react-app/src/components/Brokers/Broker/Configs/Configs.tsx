import React from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { ClusterBrokerParam } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import {
  useBrokerConfig,
  useUpdateBrokerConfigByName,
} from 'lib/hooks/api/brokers';
import Table from 'components/common/NewTable';
import { BrokerConfig } from 'generated-sources';

import InputCell from './InputCell';

const Configs: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();
  const { data = [] } = useBrokerConfig(clusterName, Number(brokerId));
  const stateMutation = useUpdateBrokerConfigByName(
    clusterName,
    Number(brokerId)
  );

  const renderCell = (props: CellContext<BrokerConfig, unknown>) => (
    <InputCell
      {...props}
      onUpdate={(name: string, value: string) => {
        stateMutation.mutateAsync({
          name,
          brokerConfigItem: {
            value,
          },
        });
      }}
    />
  );

  const columns = React.useMemo<ColumnDef<BrokerConfig>[]>(
    () => [
      { header: 'Key', accessorKey: 'name' },
      {
        header: 'Value',
        accessorKey: 'value',
        cell: renderCell,
      },
    ],
    []
  );

  return <Table columns={columns} data={data} />;
};

export default Configs;
