import React, { useCallback, useEffect, FC, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Editor from 'components/common/Editor/Editor';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import { executeKsql } from 'redux/actions/thunks/ksqlDb';
import ResultRenderer from 'components/KsqlDb/Query/ResultRenderer';
import { useDispatch, useSelector } from 'react-redux';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { resetExecutionResult } from 'redux/actions';
import { Button } from 'components/common/Button/Button';
import { BASE_PARAMS } from 'lib/constants';
import { KsqlResponse, KsqlTableResponse } from 'generated-sources';

import * as S from './Query.styled';

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
});

const Query: FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const sse = React.useRef<EventSource | null>(null);
  const [continuousFetching, setContinuousFetching] = useState(false);
  const dispatch = useDispatch();

  const { executionResult, fetching } = useSelector(getKsqlExecution);
  const [table, setTable] = useState<KsqlTableResponse | null>(null);

  const reset = useCallback(() => {
    dispatch(resetExecutionResult());
  }, [dispatch, resetExecutionResult]);

  useEffect(() => {
    return reset;
  }, []);

  const closeSSE = useCallback(() => {
    if (sse.current) {
      sse.current.close();
      setContinuousFetching(false);
    }
  }, [sse, setContinuousFetching]);

  useEffect(() => {
    if (!sse.current && executionResult?.pipeId) {
      const url = `${BASE_PARAMS.basePath}/api/clusters/${clusterName}/ksql/response?pipeId=${executionResult?.pipeId}`;
      sse.current = new EventSource(url);

      // setContinuousFetching(true);

      sse.current.onopen = () => {
        setContinuousFetching(true);
      };

      sse.current.onmessage = ({ data }) => {
        const { table: responseTable }: KsqlResponse = JSON.parse(data);
        if (responseTable) setTable(responseTable);
      };

      sse.current.onerror = () => {
        closeSSE();
      };
    }
    return () => {
      closeSSE();
    };
  }, [executionResult]);

  const handleSSECancel = () => {
    if (!sse.current) return;

    reset();
    closeSSE();
  };

  const { handleSubmit, setValue, control } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const submitHandler = useCallback((values: FormValues) => {
    dispatch(
      executeKsql({
        clusterName,
        ksqlCommandV2: {
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
      <S.QueryWrapper>
        <form onSubmit={handleSubmit(submitHandler)}>
          <S.KSQLInputsWrapper>
            <div>
              <S.KSQLInputHeader>
                <label>KSQL</label>
                <Button
                  onClick={() => setValue('ksql', '')}
                  buttonType="primary"
                  buttonSize="S"
                  isInverted
                >
                  Clear
                </Button>
              </S.KSQLInputHeader>
              <Controller
                control={control}
                name="ksql"
                render={({ field }) => (
                  <SQLEditor {...field} readOnly={fetching} />
                )}
              />
            </div>
            <div>
              <S.KSQLInputHeader>
                <label>Stream properties</label>
                <Button
                  onClick={() => setValue('streamsProperties', '')}
                  buttonType="primary"
                  buttonSize="S"
                  isInverted
                >
                  Clear
                </Button>
              </S.KSQLInputHeader>
              <Controller
                control={control}
                name="streamsProperties"
                render={({ field }) => (
                  <Editor {...field} readOnly={fetching} />
                )}
              />
            </div>
          </S.KSQLInputsWrapper>
          <S.KSQLButtons>
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
              disabled={!table}
              onClick={() => {
                reset();
                handleSSECancel();
              }}
            >
              Clear results
            </Button>
          </S.KSQLButtons>
        </form>
      </S.QueryWrapper>
      {table && <ResultRenderer result={table} />}
      {continuousFetching && (
        <>
          <S.ContinuousLoader />
        </>
      )}
    </>
  );
};

export default Query;
