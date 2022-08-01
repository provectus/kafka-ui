import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { KsqlStreamDescription, KsqlTableDescription } from 'generated-sources';
import { useTableState } from 'lib/hooks/useTableState';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import { ksqlRowData } from 'components/KsqlDb/List/KsqlDbItem/utils/ksqlRowData';

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
  const tableState = useTableState<KsqlTableState, string>(preparedRows, {
    idSelector: ({ name }) => name,
    totalPages: 0,
  });

  if (fetching) {
    return <PageLoader />;
  }
  return (
    <SmartTable
      tableState={tableState}
      isFullwidth
      placeholder="No tables or streams found"
      hoverable
    >
      <TableColumn title="Name" field="name" />
      <TableColumn title="Topic" field="topic" />
      <TableColumn title="Key Format" field="keyFormat" />
      <TableColumn title="Value Format" field="valueFormat" />
      <TableColumn title="Is Windowed" field="isWindowed" />
    </SmartTable>
  );
};

export default KsqlDbItem;
