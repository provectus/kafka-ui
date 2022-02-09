import React, { useCallback, useEffect, FC, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Editor from 'components/common/Editor/Editor';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import TableRenderer from 'components/KsqlDb/Query/renderer/TableRenderer/TableRenderer';
import {
  executeKsql,
  resetExecutionResult,
} from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { Button } from 'components/common/Button/Button';
import { BASE_PARAMS } from 'lib/constants';
import { KsqlResponse, KsqlTableResponse } from 'generated-sources';
import { alertAdded, alertDissmissed } from 'redux/reducers/alerts/alertsSlice';
import { now } from 'lodash';
import { number } from 'yup/lib/locale';

import * as S from './Query.styled';

const AUTO_DISMISS_TIME = 8_000;

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
});

const getFormattedErrorFromTableData = (
  responseValues: KsqlTableResponse['values']
): { title: string; message: string } => {
  // We expect someting like that
  // "columnNames": [
  //   "@type",
  //   "error_code",
  //   "message",
  //   "statementText"?,
  //   "entities"?
  // ],
  const [type, errorCode, message, statementText, entities] =
    (responseValues || [[]])[0];
  // Can't use \n - they just don't work
  return {
    title: `[Error #${errorCode}] ${type}`,
    message:
      (entities?.length ? `[${entities.join(', ')}] ` : '') +
      (statementText ? `"${statementText}" ` : '') +
      message,
  };
};

const Query: FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const sseRef = React.useRef<{ sse: EventSource | null; isOpen: boolean }>({
    sse: null,
    isOpen: false,
  });
  const [continuousFetching, setContinuousFetching] = useState(false);
  const dispatch = useDispatch();

  const { executionResult, fetching: fetchingExecutionResult } =
    useSelector(getKsqlExecution);
  const [KSQLTable, setKSQLTable] = useState<KsqlTableResponse | null>(null);

  const reset = useCallback(() => {
    dispatch(resetExecutionResult());
  }, [dispatch, resetExecutionResult]);

  useEffect(() => {
    return reset;
  }, []);

  const destroySSE = useCallback(() => {
    if (sseRef.current?.sse) {
      sseRef.current.sse.close();
      setContinuousFetching(false);
      sseRef.current.sse = null;
      sseRef.current.isOpen = false;
    }
  }, [sseRef, setContinuousFetching]);

  const handleSSECancel = useCallback(() => {
    reset();
    destroySSE();
  }, [reset, destroySSE]);

  const handleClearResults = useCallback(() => {
    setKSQLTable(null);
    handleSSECancel();
  }, [setKSQLTable, handleSSECancel]);

  const createSSE = useCallback(
    (pipeId: string) => {
      const url = `${BASE_PARAMS.basePath}/api/clusters/${clusterName}/ksql/response?pipeId=${pipeId}`;
      sseRef.current.sse = new EventSource(url);

      sseRef.current.sse.onopen = () => {
        sseRef.current.isOpen = true;
        setContinuousFetching(true);
      };

      sseRef.current.sse.onmessage = ({ data }) => {
        const { table }: KsqlResponse = JSON.parse(data);
        if (table) {
          switch (table?.header) {
            case 'Execution error': {
              const { title, message } = getFormattedErrorFromTableData(
                table.values
              );
              dispatch(
                alertAdded({
                  id: `${url}-executionError`,
                  type: 'error',
                  title,
                  message,
                  createdAt: now(),
                })
              );
              setTimeout(
                () => dispatch(alertDissmissed(`${url}-executionError`)),
                AUTO_DISMISS_TIME
              );
              break;
            }
            case 'Schema': {
              setKSQLTable(table);
              break;
            }
            case 'Row': {
              setKSQLTable((PrevKSQLTable) => {
                return {
                  header: PrevKSQLTable?.header,
                  columnNames: PrevKSQLTable?.columnNames,
                  values: [
                    ...(PrevKSQLTable?.values || []),
                    ...(table?.values || []),
                  ],
                };
              });
              break;
            }
            case 'Query Result': {
              dispatch(
                alertAdded({
                  id: `${url}-querySuccess`,
                  type: 'success',
                  title: 'Query succeed',
                  message: '',
                  createdAt: now(),
                })
              );
              setTimeout(
                () => dispatch(alertDissmissed(`${url}-querySuccess`)),
                AUTO_DISMISS_TIME
              );
              break;
            }
            case 'Source Description':
            case 'properties':
            default: {
              setKSQLTable(table);
              break;
            }
          }
        }
      };

      sseRef.current.sse.onerror = (
        e: Event & { code?: number; message?: string }
      ) => {
        // if it's open - new know that server responded without opening SSE
        if (!sseRef.current.isOpen) {
          dispatch(
            alertAdded({
              id: `${url}-connectionClosedError`,
              type: 'error',
              title: `${
                e?.code ? `[Error #${e.code}] ` : ''
              }SSE connection closed`,
              message: e?.message || 'Your query was immediately rejected',
              createdAt: now(),
            })
          );
          setTimeout(
            () => dispatch(alertDissmissed(`${url}-connectionClosedError`)),
            AUTO_DISMISS_TIME
          );
        }
        destroySSE();
      };
    },
    [
      BASE_PARAMS,
      sseRef,
      setContinuousFetching,
      getFormattedErrorFromTableData,
      dispatch,
      alertAdded,
      alertDissmissed,
      setKSQLTable,
      destroySSE,
    ]
  );

  useEffect(() => {
    if (!sseRef.current.sse && executionResult?.pipeId) {
      createSSE(executionResult.pipeId);
    }
    return () => {
      destroySSE();
    };
  }, [sseRef, executionResult, createSSE, destroySSE]);

  const { handleSubmit, setValue, control } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const submitHandler = useCallback(
    (values: FormValues) => {
      handleSSECancel();
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
    },
    [handleSSECancel, dispatch, executeKsql]
  );

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
                  <SQLEditor
                    {...field}
                    readOnly={fetchingExecutionResult || continuousFetching}
                  />
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
                  <Editor
                    {...field}
                    readOnly={fetchingExecutionResult || continuousFetching}
                  />
                )}
              />
            </div>
          </S.KSQLInputsWrapper>
          <S.KSQLButtons>
            <Button
              buttonType="primary"
              buttonSize="M"
              type="submit"
              disabled={fetchingExecutionResult || continuousFetching}
            >
              Execute
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="M"
              disabled={!KSQLTable}
              onClick={() => handleClearResults()}
            >
              Clear results
            </Button>
          </S.KSQLButtons>
        </form>
      </S.QueryWrapper>
      {KSQLTable && <TableRenderer table={KSQLTable} />}
      {continuousFetching && <S.ContinuousLoader />}
    </>
  );
};

export default Query;
