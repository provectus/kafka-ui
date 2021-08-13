import Indicator from 'components/common/Dashboard/Indicator';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListItem from 'components/KsqlDb/List/ListItem';
import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { fetchKsqlDbTables } from 'redux/actions/thunks/ksqlDb';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';
import { Link } from 'react-router-dom';
import { clusterKsqlDbQueryPath } from 'lib/paths';

const headers = [
  { Header: 'Type', accessor: 'type' },
  { Header: 'Name', accessor: 'name' },
  { Header: 'Topic', accessor: 'topic' },
  { Header: 'Key Format', accessor: 'keyFormat' },
  { Header: 'Value Format', accessor: 'valueFormat' },
];

const accessors = headers.map((header) => header.accessor);

const List: FC = () => {
  const dispatch = useDispatch();

  const { clusterName } = useParams<{ clusterName: string }>();

  const { rows, fetching, tablesCount, streamsCount } =
    useSelector(getKsqlDbTables);

  useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, []);

  return (
    <>
      <MetricsWrapper wrapperClassName="is-justify-content-space-between">
        <div className="column is-flex m-0 p-0">
          <Indicator
            className="level-left is-one-third mr-3"
            label="Tables"
            title="Tables"
            fetching={fetching}
          >
            {tablesCount}
          </Indicator>
          <Indicator
            className="level-left is-one-third ml-3"
            label="Streams"
            title="Streams"
            fetching={fetching}
          >
            {streamsCount}
          </Indicator>
        </div>
        <Link
          to={clusterKsqlDbQueryPath(clusterName)}
          className="button is-primary"
        >
          Execute ksql
        </Link>
      </MetricsWrapper>
      <div className="box">
        {fetching ? (
          <PageLoader />
        ) : (
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th> </th>
                {headers.map(({ Header, accessor }) => (
                  <th key={accessor}>{Header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <ListItem key={row.name} accessors={accessors} data={row} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length}>No tables or streams found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default List;
