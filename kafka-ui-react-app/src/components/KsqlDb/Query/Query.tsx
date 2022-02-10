import React, { useCallback, useEffect, FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Editor from 'components/common/Editor/Editor';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import {
  executeKsql,
  resetExecutionResult,
} from 'redux/reducers/ksqlDb/ksqlDbSlice';
import ResultRenderer from 'components/KsqlDb/Query/ResultRenderer';
import { useDispatch, useSelector } from 'react-redux';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { Button } from 'components/common/Button/Button';

import {
  KSQLButtons,
  KSQLInputHeader,
  KSQLInputsWrapper,
  QueryWrapper,
} from './Query.styled';

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

  const { handleSubmit, setValue, control } = useForm<FormValues>({
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
      <QueryWrapper>
        <form onSubmit={handleSubmit(submitHandler)}>
          <KSQLInputsWrapper>
            <div>
              <KSQLInputHeader>
                <label>KSQL</label>
                <Button
                  onClick={() => setValue('ksql', '')}
                  buttonType="primary"
                  buttonSize="S"
                  isInverted
                >
                  Clear
                </Button>
              </KSQLInputHeader>
              <Controller
                control={control}
                name="ksql"
                render={({ field }) => (
                  <SQLEditor {...field} readOnly={fetching} />
                )}
              />
            </div>
            <div>
              <KSQLInputHeader>
                <label>Stream properties</label>
                <Button
                  onClick={() => setValue('streamsProperties', '')}
                  buttonType="primary"
                  buttonSize="S"
                  isInverted
                >
                  Clear
                </Button>
              </KSQLInputHeader>
              <Controller
                control={control}
                name="streamsProperties"
                render={({ field }) => (
                  <Editor {...field} readOnly={fetching} />
                )}
              />
            </div>
          </KSQLInputsWrapper>
          <KSQLButtons>
            <Button
              buttonType="primary"
              buttonSize="M"
              type="submit"
              disabled={fetching}
            >
              Execute
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="M"
              disabled={!executionResult}
              onClick={reset}
            >
              Clear results
            </Button>
          </KSQLButtons>
        </form>
      </QueryWrapper>
      <ResultRenderer result={executionResult} />
    </>
  );
};

export default Query;
