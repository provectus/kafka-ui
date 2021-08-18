import React, { useCallback, useEffect, FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import { executeKsql } from 'redux/actions/thunks/ksqlDb';
import ResultRenderer from 'components/KsqlDb/Query/ResultRenderer';
import { useDispatch, useSelector } from 'react-redux';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { resetExecutionResult } from 'redux/actions';

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
});

const Query: FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const dispatch = useDispatch();

  const { executionResult, fetching } = useSelector(getKsqlExecution);

  const reset = useCallback(() => {
    dispatch(resetExecutionResult());
  }, [dispatch]);

  useEffect(() => {
    return reset;
  }, []);

  const { handleSubmit, control } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const submitHandler = useCallback(async (values: FormValues) => {
    dispatch(
      executeKsql({
        clusterName,
        ksqlCommand: {
          ...values,
          streamsProperties: values.streamsProperties
            ? JSON.parse(values.streamsProperties)
            : undefined,
        },
      })
    );
  }, []);

  return (
    <>
      <div className="box">
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="columns">
            <div className="control column m-0">
              <label className="label">KSQL</label>
              <Controller
                control={control}
                name="ksql"
                render={({ field }) => (
                  <SQLEditor {...field} readOnly={fetching} />
                )}
              />
            </div>
            <div className="control column m-0">
              <label className="label">Stream properties</label>
              <Controller
                control={control}
                name="streamsProperties"
                render={({ field }) => (
                  <JSONEditor {...field} readOnly={fetching} />
                )}
              />
            </div>
          </div>
          <div className="columns">
            <div className="column is-flex-grow-0">
              <button
                className="button is-primary"
                type="submit"
                disabled={fetching}
              >
                Execute
              </button>
            </div>
            <div className="column is-flex-grow-0">
              <button
                className="button is-danger"
                type="button"
                disabled={!executionResult}
                onClick={reset}
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>
      <ResultRenderer result={executionResult} />
    </>
  );
};

export default Query;
