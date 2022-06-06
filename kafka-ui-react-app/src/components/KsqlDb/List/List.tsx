import React, { FC, useEffect } from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import * as Metrics from 'components/common/Metrics';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListItem from 'components/KsqlDb/List/ListItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKsqlDbTables } from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';
import { clusterKsqlDbQueryRelativePath, ClusterNameRoute } from 'lib/paths';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Button } from 'components/common/Button/Button';
import { KsqlDescription } from 'redux/interfaces/ksqlDb';

export type KsqlDescriptionAccessor = keyof KsqlDescription;

interface HeadersType {
  Header: string;
  accessor: KsqlDescriptionAccessor;
}
const headers: HeadersType[] = [
  { Header: 'Type', accessor: 'type' },
  { Header: 'Name', accessor: 'name' },
  { Header: 'Topic', accessor: 'topic' },
  { Header: 'Key Format', accessor: 'keyFormat' },
  { Header: 'Value Format', accessor: 'valueFormat' },
];

const accessors = headers.map((header) => header.accessor);

const List: FC = () => {
  const dispatch = useDispatch();

  const { clusterName } = useAppParams<ClusterNameRoute>();

  const { rows, fetching, tablesCount, streamsCount } =
    useSelector(getKsqlDbTables);

  useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, [clusterName, dispatch]);

  return (
    <>
      <PageHeading text="KSQL DB">
        <Button
          to={clusterKsqlDbQueryRelativePath}
          buttonType="primary"
          buttonSize="M"
        >
          Execute KSQL Request
        </Button>
      </PageHeading>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Tables" title="Tables" fetching={fetching}>
            {tablesCount}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="Streams"
            title="Streams"
            fetching={fetching}
          >
            {streamsCount}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
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
              {rows.map((row) => (
                <ListItem key={row.name} accessors={accessors} data={row} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length + 1}>
                    No tables or streams found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default List;
