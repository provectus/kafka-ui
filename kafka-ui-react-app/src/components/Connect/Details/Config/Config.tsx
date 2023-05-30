import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { RouterParamsClusterConnectConnector } from 'lib/paths';
import yup from 'lib/yupExtended';
import Editor from 'components/common/Editor/Editor';
import { Button } from 'components/common/Button/Button';
import {
  useConnectorConfig,
  useUpdateConnectorConfig,
} from 'lib/hooks/api/kafkaConnect';

import {
  ConnectEditWarningMessageStyled,
  ConnectEditWrapperStyled,
} from './Config.styled';

const validationSchema = yup.object().shape({
  config: yup.string().required().isJsonObject(),
});

interface FormValues {
  config: string;
}

const Config: React.FC = () => {
  const routerParams = useAppParams<RouterParamsClusterConnectConnector>();
  const { data: config } = useConnectorConfig(routerParams);
  const mutation = useUpdateConnectorConfig(routerParams);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, isSubmitting, isValid, errors },
    setValue,
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      config: JSON.stringify(config, null, '\t'),
    },
  });

  React.useEffect(() => {
    if (config) {
      setValue('config', JSON.stringify(config, null, '\t'));
    }
  }, [config, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      const requestBody = JSON.parse(values.config.trim());
      await mutation.mutateAsync(requestBody);
      reset(values);
    } catch (e) {
      // do nothing
    }
  };

  const hasCredentials = JSON.stringify(config, null, '\t').includes(
    '"******"'
  );
  return (
    <ConnectEditWrapperStyled>
      {hasCredentials && (
        <ConnectEditWarningMessageStyled>
          Please replace ****** with the real credential values to avoid
          accidentally breaking your connector config!
        </ConnectEditWarningMessageStyled>
      )}
      <form onSubmit={handleSubmit(onSubmit)} aria-label="Edit connect form">
        <div>
          <Controller
            control={control}
            name="config"
            render={({ field }) => (
              <Editor {...field} readOnly={isSubmitting} />
            )}
          />
        </div>
        <div>
          <ErrorMessage errors={errors} name="config" />
        </div>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="submit"
          disabled={!isValid || isSubmitting || !isDirty}
        >
          Submit
        </Button>
      </form>
    </ConnectEditWrapperStyled>
  );
};

export default Config;
