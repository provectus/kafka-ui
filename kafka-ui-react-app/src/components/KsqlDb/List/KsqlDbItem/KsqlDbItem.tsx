import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import ListItem from 'components/KsqlDb/List/ListItem';
import {
  KsqlDescriptionAccessor,
  HeadersType,
} from 'components/KsqlDb/List/List';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { KsqlStreamDescription, KsqlTableDescription } from 'generated-sources';

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
  headers: HeadersType[];
  accessors: KsqlDescriptionAccessor[];
  fetching: boolean;
  rows: RowsType;
}

const KsqlDbItem: React.FC<KsqlDbItemProps> = ({
  headers,
  accessors,
  type,
  fetching,
  rows,
}) => {
  return (
    <div>
      {fetching ? (
        <PageLoader />
      ) : (
        <Table isFullwidth>
          <thead>
            <tr>
              {headers.map(({ Header, accessor }) => (
                <TableHeaderCell title={Header} key={accessor} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows[type].map((row) => (
              <ListItem key={row.name} accessors={accessors} data={row} />
            ))}
            {rows[type].length === 0 && (
              <tr>
                <td colSpan={headers.length + 1}>No {type} found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default KsqlDbItem;
