import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { KsqlStreamDescription, KsqlTableDescription } from 'generated-sources';
import { useTableState } from 'lib/hooks/useTableState';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import { KsqlDescription } from 'redux/interfaces/ksqlDb';
import { ksqlRowData } from 'components/KsqlDb/List/KsqlDbItem/utils/ksqlRowData';

export enum KsqlDbItemType {
  Tables = 'tables',
  Streams = 'streams',
}

export interface RowsType {
  tables: KsqlTableDescription[];
  streams: KsqlStreamDescription[];
}
export interface KsqlDbItemProps {
  type: KsqlDbItemType;
  fetching: boolean;
  rows: RowsType;
}

export type KsqlDescriptionAccessor = keyof KsqlDescription;

export interface HeadersType {
  Header: string;
  accessor: KsqlDescriptionAccessor;
}

export interface KsqlTableState {
  name: string;
  topic: string;
  keyFormat: string;
  valueFormat: string;
  isWindowed: string;
}

export const headers: HeadersType[] = [
  { Header: 'Name', accessor: 'name' },
  { Header: 'Topic', accessor: 'topic' },
  { Header: 'Key Format', accessor: 'keyFormat' },
  { Header: 'Value Format', accessor: 'valueFormat' },
  { Header: 'Is Windowed', accessor: 'isWindowed' },
];

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
