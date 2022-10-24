import React from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { ClusterBrokerParam } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import {
  useBrokerConfig,
  useUpdateBrokerConfigByName,
} from 'lib/hooks/api/brokers';
import Table from 'components/common/NewTable';
import { BrokerConfig, ConfigSource } from 'generated-sources';
import Search from 'components/common/Search/Search';
import Tooltip from 'components/common/Tooltip/Tooltip';

import InputCell from './InputCell';
import * as S from './Configs.styled';
import { ConfigSourceTooltip } from './ConfigsType';

const Configs: React.FC = () => {
  const [keyword, setKeyword] = React.useState('');
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();
  const { data = [] } = useBrokerConfig(clusterName, Number(brokerId));
  const stateMutation = useUpdateBrokerConfigByName(
    clusterName,
    Number(brokerId)
  );

  const getData = () => {
    return data
      .filter((item) => item.name.toLocaleLowerCase().indexOf(keyword) > -1)
      .sort((a, b) => {
        if (a.source === b.source) return 0;

        return a.source === ConfigSource.DYNAMIC_BROKER_CONFIG ? -1 : 1;
      });
  };

  const dataSource = React.useMemo(() => getData(), [data, keyword]);

  const renderCell = (props: CellContext<BrokerConfig, unknown>) => (
    <InputCell
      {...props}
      onUpdate={(name, value) => {
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
      {
        header: 'Source',
        accessorKey: 'source',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ row }) => {
          const { source } = row.original;
          const value = row.original.source;
          const messageTooltip = ConfigSourceTooltip[source];
          return <Tooltip value={value} messageTooltip={messageTooltip} />;
        },
      },
    ],
    []
  );

  return (
    <>
      <S.SearchWrapper>
        <Search
          onChange={setKeyword}
          placeholder="Search by Key"
          value={keyword}
        />
      </S.SearchWrapper>
      <Table columns={columns} data={dataSource} />
    </>
  );
};

export default Configs;
