import React from 'react';
import Table from 'components/common/NewTable';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { useTopicConfig } from 'lib/hooks/api/topics';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { TopicConfig } from 'generated-sources';

import * as S from './Settings.styled';

const ValueCell: React.FC<CellContext<TopicConfig, unknown>> = ({
  row,
  renderValue,
}) => {
  const { defaultValue } = row.original;
  const { value } = row.original;
  const hasCustomValue = !!defaultValue && value !== defaultValue;

  return (
    <S.Value $hasCustomValue={hasCustomValue}>{renderValue<string>()}</S.Value>
  );
};

const DefaultValueCell: React.FC<CellContext<TopicConfig, unknown>> = ({
  row,
  getValue,
}) => {
  const defaultValue = getValue<TopicConfig['defaultValue']>();
  const { value } = row.original;
  const hasCustomValue = !!defaultValue && value !== defaultValue;
  return <S.DefaultValue>{hasCustomValue && defaultValue}</S.DefaultValue>;
};

const Settings: React.FC = () => {
  const props = useAppParams<RouteParamsClusterTopic>();
  const { data = [] } = useTopicConfig(props);

  const columns = React.useMemo<ColumnDef<TopicConfig>[]>(
    () => [
      {
        header: 'Key',
        accessorKey: 'name',
        cell: ValueCell,
      },
      {
        header: 'Value',
        accessorKey: 'value',
        cell: ValueCell,
      },
      {
        header: 'Default Value',
        accessorKey: 'defaultValue',
        cell: DefaultValueCell,
      },
    ],
    []
  );

  return <Table columns={columns} data={data} />;
};

export default Settings;
