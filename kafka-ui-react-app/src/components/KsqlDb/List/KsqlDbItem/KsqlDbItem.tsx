import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import ListItem from 'components/KsqlDb/List/ListItem';
import {
  KsqlDescriptionAccessor,
  HeadersType,
} from 'components/KsqlDb/List/List';
import { ClusterNameRoute } from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { fetchKsqlDbTables } from 'redux/reducers/ksqlDb/ksqlDbSlice';
import useAppParams from 'lib/hooks/useAppParams';

export enum KsqlDbItemType {
  Tables = 'tables',
  Streams = 'streams',
}

interface TableProps {
  type: KsqlDbItemType;
  headers: HeadersType[];
  accessors: KsqlDescriptionAccessor[];
}

const KsqlDbItem: React.FC<TableProps> = ({ headers, accessors, type }) => {
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const dispatch = useDispatch();

  const { rows, fetching } = useSelector(getKsqlDbTables);

  React.useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, [clusterName, dispatch]);

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
