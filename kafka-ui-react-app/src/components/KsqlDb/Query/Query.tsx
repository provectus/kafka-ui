import React, { useCallback, useEffect, FC, useState } from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import TableRenderer from 'components/KsqlDb/Query/renderer/TableRenderer/TableRenderer';
import {
  executeKsql,
  resetExecutionResult,
} from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { BASE_PARAMS } from 'lib/constants';
import { KsqlResponse, KsqlTableResponse } from 'generated-sources';
import { clusterKsqlDbPath, ClusterNameRoute } from 'lib/paths';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import { showAlert, showSuccessAlert } from 'lib/errorHandling';
import PageHeading from 'components/common/PageHeading/PageHeading';

import type { FormValues } from './QueryForm/QueryForm';
import * as S from './Query.styled';
import QueryForm from './QueryForm/QueryForm';

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
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const sseRef = React.useRef<{ sse: EventSource | null; isOpen: boolean }>({
    sse: null,
    isOpen: false,
  });
  const [fetching, setFetching] = useState(false);
  const dispatch = useAppDispatch();

  const { executionResult } = useAppSelector(getKsqlExecution);
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
              showAlert('error', { id, title, message });
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
              showSuccessAlert({ id, title: 'Query succeed', message: '' });
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
          showAlert('error', {
            id: `${url}-connectionClosedError`,
            title: '',
            message: 'SSE connection closed',
          });
        }
        destroySSE();
      };
    },
    [clusterName, dispatch]
  );

  const submitHandler = useCallback(
    (values: FormValues) => {
      const filteredProperties = values.streamsProperties.filter(
        (property) => property.key != null
      );
      const streamsProperties = filteredProperties.reduce(
        (acc, current) => ({
          ...acc,
          [current.key as keyof string]: current.value,
        }),
        {} as { [key: string]: string }
      );
      setFetching(true);
      dispatch(
        executeKsql({
          clusterName,
          ksqlCommandV2: {
            ...values,
            streamsProperties:
              values.streamsProperties[0].key !== ''
                ? JSON.parse(JSON.stringify(streamsProperties))
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
      <PageHeading
        text="Query"
        backText="KSQL DB"
        backTo={clusterKsqlDbPath(clusterName)}
      />
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
