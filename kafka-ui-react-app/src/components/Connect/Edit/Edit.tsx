import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Connector } from 'generated-sources';
import {
  ClusterName,
  ConnectName,
  ConnectorConfig,
  ConnectorName,
} from 'redux/interfaces';
import { clusterConnectConnectorConfigPath } from 'lib/paths';
import yup from 'lib/yupExtended';
import Editor from 'components/common/Editor/Editor';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { Button } from 'components/common/Button/Button';

import {
  ConnectEditWarningMessageStyled,
  ConnectEditWrapperStyled,
} from './Edit.styled';

const validationSchema = yup.object().shape({
  config: yup.string().required().isJsonObject(),
});

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

interface FormValues {
  config: string;
}

export interface EditProps {
  fetchConfig(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): Promise<void>;
  isConfigFetching: boolean;
  config: ConnectorConfig | null;
  updateConfig(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    connectorConfig: ConnectorConfig
  ): Promise<Connector | undefined>;
}

const Edit: React.FC<EditProps> = ({
  fetchConfig,
  isConfigFetching,
  config,
  updateConfig,
}) => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, isValid, errors },
    setValue,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      config: JSON.stringify(config, null, '\t'),
    },
  });

  React.useEffect(() => {
    fetchConfig(clusterName, connectName, connectorName);
  }, [fetchConfig, clusterName, connectName, connectorName]);

  React.useEffect(() => {
    if (config) {
      setValue('config', JSON.stringify(config, null, '\t'));
    }
  }, [config, setValue]);

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const connector = await updateConfig(
        clusterName,
        connectName,
        connectorName,
        JSON.parse(values.config.trim())
      );
      if (connector) {
        history.push(
          clusterConnectConnectorConfigPath(
            clusterName,
            connectName,
            connectorName
          )
        );
      }
    },
    [updateConfig, clusterName, connectName, connectorName, history]
  );

  if (isConfigFetching) return <PageLoader />;

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

export default Edit;
