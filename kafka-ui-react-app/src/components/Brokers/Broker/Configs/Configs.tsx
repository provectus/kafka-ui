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
import InfoIcon from 'components/common/Icons/InfoIcon';

import InputCell from './InputCell';
import * as S from './Configs.styled';

const tooltipContent = `DYNAMIC_TOPIC_CONFIG = dynamic topic config that is configured for a specific topic
DYNAMIC_BROKER_LOGGER_CONFIG = dynamic broker logger config that is configured for a specific broker
DYNAMIC_BROKER_CONFIG = dynamic broker config that is configured for a specific broker
DYNAMIC_DEFAULT_BROKER_CONFIG = dynamic broker config that is configured as default for all brokers in the cluster
STATIC_BROKER_CONFIG = static broker config provided as broker properties at start up (e.g. server.properties file)
DEFAULT_CONFIG = built-in default configuration for configs that have a default value
UNKNOWN = source unknown e.g. in the ConfigEntry used for alter requests where source is not set`;

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
        // eslint-disable-next-line react/no-unstable-nested-components
        header: () => {
          return (
            <S.Source>
              Source
              <Tooltip
                value={<InfoIcon />}
                content={tooltipContent}
                placement="top-end"
              />
            </S.Source>
          );
        },
        accessorKey: 'source',
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
