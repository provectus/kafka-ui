import React, { useCallback, useState, FC } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { useParams } from 'react-router';
import { ksqlDbApiClient } from 'redux/actions/thunks/ksqlDb';
import { KsqlCommandResponse } from 'generated-sources';
import ResultRenderer from 'components/KsqlDb/Query/ResultRenderer';

type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
});

const RESULT_INITIAL_VALUE = {};

const Query: FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const [result, setResult] =
    useState<KsqlCommandResponse>(RESULT_INITIAL_VALUE);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const submitHandler = useCallback(async (values: FormValues) => {
    const response = await ksqlDbApiClient.executeKsqlCommand({
      clusterName,
      ksqlCommand: {
        ...values,
        streamsProperties: values.streamsProperties
          ? JSON.parse(values.streamsProperties)
          : undefined,
      },
    });
    setResult(response);
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
                  <SQLEditor {...field} readOnly={isSubmitting} />
                )}
              />
            </div>
            <div className="control column m-0">
              <label className="label">Stream properties</label>
              <Controller
                control={control}
                name="streamsProperties"
                render={({ field }) => (
                  <JSONEditor {...field} readOnly={isSubmitting} />
                )}
              />
            </div>
          </div>
          <button className="button is-primary" type="submit">
            Execute
          </button>
        </form>
      </div>
      <ResultRenderer result={result} />
    </>
  );
};

Query.displayName = 'Query';

export default Query;
