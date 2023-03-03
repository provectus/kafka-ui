import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { KsqlStreamDescription, KsqlTableDescription } from 'generated-sources';
import { ksqlRowData } from 'components/KsqlDb/List/KsqlDbItem/utils/ksqlRowData';
import Table from 'components/common/NewTable';
import { ColumnDef } from '@tanstack/react-table';

export enum KsqlDbItemType {
  Tables = 'tables',
  Streams = 'streams',
}

interface RowsType {
  tables: KsqlTableDescription[];
  streams: KsqlStreamDescription[];
}
export interface KsqlDbItemProps {
  type: KsqlDbItemType;
  fetching: boolean;
  rows: RowsType;
}

export interface KsqlTableState {
  name: string;
  topic: string;
  keyFormat: string;
  valueFormat: string;
  isWindowed: string;
}

const KsqlDbItem: React.FC<KsqlDbItemProps> = ({ type, fetching, rows }) => {
  const preparedRows = rows[type]?.map(ksqlRowData) || [];

  const columns = React.useMemo<ColumnDef<KsqlTableState>[]>(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Topic', accessorKey: 'topic' },
      { header: 'Key Format', accessorKey: 'keyFormat' },
      { header: 'Value Format', accessorKey: 'valueFormat' },
      { header: 'Is Windowed', accessorKey: 'isWindowed' },
    ],
    []
  );

  if (fetching) {
    return <PageLoader />;
  }
  return (
    <Table
      data={preparedRows}
      columns={columns}
      emptyMessage="No tables or streams found"
      enableSorting
    />
  );
};

export default KsqlDbItem;
