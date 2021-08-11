import { yupResolver } from '@hookform/resolvers/yup';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import Indicator from 'components/common/Dashboard/Indicator';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import PageLoader from 'components/common/PageLoader/PageLoader';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import React, { FC, useEffect, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { fetchKsqlDbTables } from 'redux/actions/thunks/ksqlDb';
import { connects } from 'redux/reducers/connect/__test__/fixtures';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';

const validationSchema = yup.object({
  query: yup.string().trim().required(),
});

type FormValues = {
  query: string;
};

const headers = [
  { Header: 'Type', accessor: 'type' },
  { Header: 'Name', accessor: 'name' },
  { Header: 'Topic', accessor: 'topic' },
  { Header: 'Key Format', accessor: 'keyFormat' },
  { Header: 'Value Format', accessor: 'valueFormat' },
];

const List: FC = () => {
  const dispatch = useDispatch();
  const [isModalShown, setIsShow] = useState(false);
  const {
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      query: '',
    },
  });
  const { clusterName } = useParams<{ clusterName: string }>();

  const { rows, fetching, tablesCount, streamsCount } =
    useSelector(getKsqlDbTables);

  useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, []);

  const toggleShown = useCallback(() => {
    setIsShow((prevState) => !prevState);
  }, []);

  return (
    <>
      <ConfirmationModal
        title="Execute a query"
        isOpen={isModalShown}
        onConfirm={toggleShown}
        onCancel={toggleShown}
      >
        <div className="control">
          <Controller
            control={control}
            name="query"
            render={({ field }) => (
              <SQLEditor {...field} readOnly={isSubmitting} />
            )}
          />
        </div>
      </ConfirmationModal>
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
          <div className="box">
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
          </div>
        )}
      </div>
    </>
  );
};

export default List;
