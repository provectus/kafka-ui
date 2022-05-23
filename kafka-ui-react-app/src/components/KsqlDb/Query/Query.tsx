import React, { useCallback, useEffect, FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableRenderer from 'components/KsqlDb/Query/renderer/TableRenderer/TableRenderer';
import {
  executeKsql,
  resetExecutionResult,
} from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { BASE_PARAMS } from 'lib/constants';
import { KsqlResponse, KsqlTableResponse } from 'generated-sources';
import { alertAdded, alertDissmissed } from 'redux/reducers/alerts/alertsSlice';
import { now } from 'lodash';

import type { FormValues } from './QueryForm/QueryForm';
import * as S from './Query.styled';
import QueryForm from './QueryForm/QueryForm';

const AUTO_DISMISS_TIME = 8_000;

export const getFormattedErrorFromTableData = (
  responseValues: KsqlTableResponse['values']
): { title: string; message: string } => {
  // We expect someting like that
  // [[
  //   "@type",
  //   "error_code",
  //   "message",
  //   "statementText"?,
  //   "entities"?
  // ]],
  // or
  // [["message"]]

  if (!responseValues || !responseValues.length) {
    return {
      title: 'Unknown error',
      message: 'Recieved empty response',
    };
  }

  let title = '';
  let message = '';
  if (responseValues[0].length < 2) {
    const [messageText] = responseValues[0];
    title = messageText;
  } else {
    const [type, errorCode, messageText, statementText, entities] =
      responseValues[0];
    title = `[Error #${errorCode}] ${type}`;
    message =
      (entities?.length ? `[${entities.join(', ')}] ` : '') +
      (statementText ? `"${statementText}" ` : '') +
      messageText;
  }

  return {
    title,
    message,
  };
};

const Query: FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();

  const sseRef = React.useRef<{ sse: EventSource | null; isOpen: boolean }>({
    sse: null,
    isOpen: false,
  });
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch();

  const { executionResult } = useSelector(getKsqlExecution);
  const [KSQLTable, setKSQLTable] = useState<KsqlTableResponse | null>(null);

  const reset = useCallback(() => {
    dispatch(resetExecutionResult());
  }, [dispatch]);

  useEffect(() => {
    return reset;
  }, [reset]);

  const destroySSE = () => {
    if (sseRef.current?.sse) {
      sseRef.current.sse.close();
      setFetching(false);
      sseRef.current.sse = null;
      sseRef.current.isOpen = false;
    }
  };

  const handleSSECancel = useCallback(() => {
    reset();
    destroySSE();
  }, [reset]);

  const createSSE = useCallback(
    (pipeId: string) => {
      const url = `${BASE_PARAMS.basePath}/api/clusters/${clusterName}/ksql/response?pipeId=${pipeId}`;
      const sse = new EventSource(url);
      sseRef.current.sse = sse;
      setFetching(true);

      sse.onopen = () => {
        sseRef.current.isOpen = true;
      };

      sse.onmessage = ({ data }) => {
        const { table }: KsqlResponse = JSON.parse(data);
        if (table) {
          switch (table?.header) {
            case 'Execution error': {
              const { title, message } = getFormattedErrorFromTableData(
                table.values
              );
              const id = `${url}-executionError`;
              dispatch(
                alertAdded({
                  id,
                  type: 'error',
                  title,
                  message,
                  createdAt: now(),
                })
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
              const id = `${url}-querySuccess`;
              dispatch(
                alertAdded({
                  id,
                  type: 'success',
                  title: 'Query succeed',
                  message: '',
                  createdAt: now(),
                })
              );

              setTimeout(() => {
                dispatch(alertDissmissed(id));
              }, AUTO_DISMISS_TIME);
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
        return sse;
      };

      sse.onerror = () => {
        // if it's open - we know that server responded without opening SSE
        if (!sseRef.current.isOpen) {
          const id = `${url}-connectionClosedError`;
          dispatch(
            alertAdded({
              id,
              type: 'error',
              title: 'SSE connection closed',
              message: '',
              createdAt: now(),
            })
          );

          setTimeout(() => {
            dispatch(alertDissmissed(id));
          }, AUTO_DISMISS_TIME);
        }
        destroySSE();
      };
    },
    [clusterName, dispatch]
  );

  const submitHandler = useCallback(
    (values: FormValues) => {
      setFetching(true);
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
    [dispatch, clusterName]
  );
  useEffect(() => {
    if (executionResult?.pipeId) {
      createSSE(executionResult.pipeId);
    }
    return () => {
      destroySSE();
    };
  }, [createSSE, executionResult]);

  return (
    <>
      <QueryForm
        fetching={fetching}
        hasResults={!!KSQLTable}
        handleClearResults={() => setKSQLTable(null)}
        handleSSECancel={handleSSECancel}
        submitHandler={submitHandler}
      />
      {KSQLTable && <TableRenderer table={KSQLTable} />}
      {fetching && <S.ContinuousLoader />}
    </>
  );
};

export default Query;
