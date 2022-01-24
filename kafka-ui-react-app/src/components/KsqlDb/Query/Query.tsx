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
import PageLoader from 'components/common/PageLoader/PageLoader';
import { KsqlResponse } from 'generated-sources';

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
  const source = React.useRef<EventSource | null>(null);
  const [continuousFetching, setContinuousFetching] = useState(false);
  const [queryDb, setQueryDb] = useState(false);
  const dispatch = useDispatch();

  const { executionResult, fetching } = useSelector(getKsqlExecution);

  const reset = useCallback(() => {
    dispatch(resetExecutionResult());
  }, [dispatch]);

  useEffect(() => {
    return reset;
  }, []);

  useEffect(() => {
    const url = `${BASE_PARAMS.basePath}/api/clusters/${clusterName}/ksql/v2`;
    const sse = new EventSource(url);

    source.current = sse;
    setContinuousFetching(true);

    sse.onopen = () => {
      // resetMessages();
      setContinuousFetching(true);
    };
    sse.onmessage = ({ data }) => {
      console.log(data);
      const { table }: KsqlResponse = JSON.parse(data);

      // switch (type) {
      //   case TopicMessageEventTypeEnum.MESSAGE:
      //     if (message) addMessage(message);
      //     break;
      //   case TopicMessageEventTypeEnum.PHASE:
      //     if (phase?.name) updatePhase(phase.name);
      //     break;
      //   case TopicMessageEventTypeEnum.CONSUMING:
      //     if (consuming) updateMeta(consuming);
      //     break;
      //   default:
      // }
    };

    sse.onerror = () => {
      setContinuousFetching(false);
      setQueryDb(false);
      sse.close();
    };

    return () => {
      setContinuousFetching(false);
      sse.close();
    };
  }, [queryDb]);

  const handleSSECancel = () => {
    if (!source.current) return;

    setContinuousFetching(false);
    setQueryDb(false);
    source.current.close();
  };

  const { handleSubmit, setValue, control } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const submitHandler = useCallback(async (values: FormValues) => {
    // setQueryDb(true);
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
      {continuousFetching && (
        <>
          <PageLoader />
          <Button
            buttonType="secondary"
            buttonSize="M"
            onClick={handleSSECancel}
          >
            Stop updating
          </Button>
        </>
      )}
      <ResultRenderer result={executionResult} />
    </>
  );
};

export default Query;
