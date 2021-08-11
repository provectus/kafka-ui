import Indicator from 'components/common/Dashboard/Indicator';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import PageLoader from 'components/common/PageLoader/PageLoader';
import React, { FC, useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { fetchKsqlDbTables } from 'redux/actions/thunks/ksqlDb';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';
import QueryModal from 'components/KsqlDb/QueryModal/QueryModal';

const headers = [
  { Header: 'Type', accessor: 'type' },
  { Header: 'Name', accessor: 'name' },
  { Header: 'Topic', accessor: 'topic' },
  { Header: 'Key Format', accessor: 'keyFormat' },
  { Header: 'Value Format', accessor: 'valueFormat' },
];

const List: FC = () => {
  const dispatch = useDispatch();
  const [isModalShown, setIsModalShow] = useState(false);

  const { clusterName } = useParams<{ clusterName: string }>();

  const { rows, fetching, tablesCount, streamsCount } =
    useSelector(getKsqlDbTables);

  useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, []);

  const toggleShown = useCallback(() => {
    setIsModalShow((prevState) => !prevState);
  }, []);

  return (
    <>
      <QueryModal
        clusterName={clusterName}
        isOpen={isModalShown}
        onCancel={toggleShown}
      />
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
        <button
          type="button"
          className="button is-primary"
          onClick={toggleShown}
        >
          Execute a query
        </button>
      </MetricsWrapper>
      <div className="box">
        {fetching ? (
          <PageLoader />
        ) : (
          <table className="table is-fullwidth">
            <thead>
              <tr>
                {headers.map(({ Header, accessor }) => (
                  <th key={accessor}>{Header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  {headers.map(({ accessor }) => (
                    <td key={accessor}>{row[accessor]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default List;
