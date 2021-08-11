import { yupResolver } from '@hookform/resolvers/yup';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import PageLoader from 'components/common/PageLoader/PageLoader';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import React, { FC, useEffect, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { fetchKsqlDbTables } from 'redux/actions/thunks/ksqlDb';
import { getKsqlDbTables } from 'redux/reducers/ksqlDb/selectors';

const validationSchema = yup.object({
  query: yup.string().trim().required(),
});

type FormValues = {
  query: string;
};

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

  const { rows, headers, fetching } = useSelector(getKsqlDbTables);

  useEffect(() => {
    dispatch(fetchKsqlDbTables(clusterName));
  }, []);

  const toggleShown = useCallback(() => {
    setIsShow((prevState) => !prevState);
  }, []);

  return (
    <div className="section">
      <div className="box">
        <div className="column is-justify-content-flex-end is-flex">
          <button
            type="button"
            className="button is-primary"
            onClick={toggleShown}
          >
            Execute a query
          </button>
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
        </div>
        {fetching ? (
          <PageLoader />
        ) : (
          <div className="box">
            <table className="table is-fullwidth">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    {headers.map((header) => (
                      <td key={header}>{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
