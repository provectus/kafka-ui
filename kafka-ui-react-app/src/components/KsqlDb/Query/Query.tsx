import React, { useCallback, useEffect, FC, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
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
import { KsqlResponse, KsqlTableResponse, SchemaType } from 'generated-sources';
import { alertAdded, alertDissmissed } from 'redux/reducers/alerts/alertsSlice';
import { now } from 'lodash';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';

import * as S from './Query.styled';

const AUTO_DISMISS_TIME = 8_000;

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
  streamsProperties: yup.lazy((value) =>
    value === '' ? yup.string().trim() : yup.string().trim().isJsonObject()
  ),
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
  // or
  // "columnNames":["message"]

  let title = '';
  let message = '';
  if (responseValues && responseValues[0].length < 2) {
    const [messageText] = responseValues[0];
    title = messageText;
  } else {
    const [type, errorCode, messageText, statementText, entities] =
      (responseValues || [[]])[0];
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

              setTimeout(() => {
                dispatch(alertDissmissed(id));
              }, AUTO_DISMISS_TIME);
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

  useEffect(() => {
    if (executionResult?.pipeId) {
      createSSE(executionResult.pipeId);
    }
    return () => {
      destroySSE();
    };
  }, [createSSE, executionResult]);

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

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

  return (
    <>
      <S.QueryWrapper>
        <form onSubmit={handleSubmit(submitHandler)}>
          <S.KSQLInputsWrapper>
            <S.Fieldset aria-labelledby="ksqlLabel">
              <S.KSQLInputHeader>
                <label id="ksqlLabel">KSQL</label>
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
                  <S.SQLEditor
                    {...field}
                    commands={[
                      {
                        // commands is array of key bindings.
                        // name for the key binding.
                        name: 'commandName',
                        // key combination used for the command.
                        bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
                        // function to execute when keys are pressed.
                        exec: () => {
                          handleSubmit(submitHandler)();
                        },
                      },
                    ]}
                    readOnly={fetching}
                  />
                )}
              />
              <FormError>
                <ErrorMessage errors={errors} name="ksql" />
              </FormError>
            </S.Fieldset>
            <S.Fieldset aria-labelledby="streamsPropertiesLabel">
              <S.KSQLInputHeader>
                <label id="streamsPropertiesLabel">
                  Stream properties (JSON format)
                </label>
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
                  <S.Editor
                    {...field}
                    commands={[
                      {
                        // commands is array of key bindings.
                        // name for the key binding.
                        name: 'commandName',
                        // key combination used for the command.
                        bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
                        // function to execute when keys are pressed.
                        exec: () => {
                          handleSubmit(submitHandler)();
                        },
                      },
                    ]}
                    schemaType={SchemaType.JSON}
                    readOnly={fetching}
                  />
                )}
              />
              <FormError>
                <ErrorMessage errors={errors} name="streamsProperties" />
              </FormError>
            </S.Fieldset>
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
              disabled={!fetching}
              onClick={() => handleSSECancel()}
            >
              Stop query
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="M"
              disabled={fetching || !KSQLTable}
              onClick={() => setKSQLTable(null)}
            >
              Clear results
            </Button>
          </S.KSQLButtons>
        </form>
      </S.QueryWrapper>
      {KSQLTable && <TableRenderer table={KSQLTable} />}
      {fetching && <S.ContinuousLoader />}
    </>
  );
};

export default Query;
