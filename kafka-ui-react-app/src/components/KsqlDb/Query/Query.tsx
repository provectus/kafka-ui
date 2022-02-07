import React, { useCallback, useEffect, FC, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Editor from 'components/common/Editor/Editor';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import { executeKsql } from 'redux/actions/thunks/ksqlDb';
import TableRenderer from 'components/KsqlDb/Query/renderer/TableRenderer/TableRenderer';
import { useDispatch, useSelector } from 'react-redux';
import { getKsqlExecution } from 'redux/reducers/ksqlDb/selectors';
import { resetExecutionResult } from 'redux/actions';
import { Button } from 'components/common/Button/Button';
import { BASE_PARAMS } from 'lib/constants';
import { KsqlResponse, KsqlTableResponse } from 'generated-sources';
import {
  alertAdded,
  serverErrorAlertAdded,
} from 'redux/reducers/alerts/alertsSlice';
import { now } from 'lodash';

import * as S from './Query.styled';

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
});

const HTTP_UNPROCESSABLE_ENTITY = 422;
// We expect someting like that
// "columnNames": [
//   "@type",
//   "error_code",
//   "message",
//   "statementText",
//   "entities"
// ],
interface AlertErrorPayload {
  status: number;
  statusText: string;
  message: string;
  url: string;
}
const getFormattedError = (
  url: string,
  responseValues: KsqlTableResponse['values']
): AlertErrorPayload => {
  const [type, errorCode, message, statementText, entities] =
    (responseValues || [[]])[0];
  // Can't use \n - they just don't work
  return {
    status: errorCode || HTTP_UNPROCESSABLE_ENTITY,
    statusText: `${type}`,
    message: `${
      entities.length ? `[${entities.join(', ')}]` : ''
    }"${statementText}" ${message}`,
    url,
  };
};

const Query: FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const sse = React.useRef<EventSource | null>(null);
  const [continuousFetching, setContinuousFetching] = useState(false);
  const dispatch = useDispatch();

  const { executionResult, fetching } = useSelector(getKsqlExecution);
  const [KSQLTable, setKSQLTable] = useState<KsqlTableResponse | null>(null);

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
      sse.current = null;
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
        const { table }: KsqlResponse = JSON.parse(data);
        if (table) {
          switch (table?.header) {
            // responsetable.header can also be `Source Description` - right now it will be rendered as table
            case 'Execution error':
              dispatch(
                serverErrorAlertAdded(getFormattedError(url, table.values))
              );
              break;
            case 'Schema':
              setKSQLTable(table);
              break;
            case 'Row':
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
            case 'Query Result':
              dispatch(
                alertAdded({
                  id: `${url}-querySuccess`,
                  type: 'success',
                  title: 'Query succeed',
                  message: '',
                  createdAt: now(),
                })
              );
              break;
            default:
              setKSQLTable(table);
              break;
          }
        }
      };

      sse.current.onerror = () => {
        closeSSE();
      };
    }
    return () => {
      closeSSE();
    };
  }, [
    dispatch,
    serverErrorAlertAdded,
    alertAdded,
    closeSSE,
    sse,
    executionResult,
  ]);

  const handleSSECancel = () => {
    reset();
    closeSSE();
  };

  const handleClearResults = () => {
    setKSQLTable(null);
    handleSSECancel();
  };

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
              disabled={!KSQLTable}
              onClick={() => handleClearResults()}
            >
              Clear results
            </Button>
          </S.KSQLButtons>
        </form>
      </S.QueryWrapper>
      {KSQLTable && <TableRenderer result={KSQLTable} />}
      {continuousFetching && (
        <>
          <S.ContinuousLoader />
        </>
      )}
    </>
  );
};

export default Query;
