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
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import PageLoader from 'components/common/PageLoader/PageLoader';

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
        JSON.parse(values.config)
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
    [updateConfig, clusterName, connectName, connectorName]
  );

  if (isConfigFetching) return <PageLoader />;

  const hasCredentials = JSON.stringify(config, null, '\t').includes(
    '"******"'
  );
  return (
    <>
      {hasCredentials && (
        <div className="notification is-danger is-light">
          Please replace ****** with the real credential values to avoid
          accidentally breaking your connector config!
        </div>
      )}
      <div className="box">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <div className="control">
              <Controller
                control={control}
                name="config"
                render={({ field }) => (
                  <JSONEditor {...field} readOnly={isSubmitting} />
                )}
              />
            </div>
            <p className="help is-danger">
              <ErrorMessage errors={errors} name="config" />
            </p>
          </div>
          <div className="field">
            <div className="control">
              <input
                type="submit"
                className="button is-primary"
                disabled={!isValid || isSubmitting || !isDirty}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Edit;
