import { useAppConfig } from 'lib/hooks/api/appConfig';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterNameRoute } from 'lib/paths';
import React from 'react';

import WizardForm, { ClusterConfigFormValues } from './WizardForm/WizardForm';

const parseBootstrapServers = (bootstrapServers?: string) =>
  bootstrapServers?.split(',').map((url) => {
    const [host, port] = url.split(':');
    return { host, port };
  });

const ClusterConfig: React.FC = () => {
  const config = useAppConfig();
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const currentClusterConfig = React.useMemo(() => {
    if (config.isSuccess && !!config.data.properties?.kafka?.clusters) {
      const current = config.data.properties?.kafka?.clusters?.find(
        ({ name }) => name === clusterName
      );

      if (current) {
        console.log(current);
        const properties = current.properties || {};

        const initialValues: Partial<ClusterConfigFormValues> = {
          name: current.name,
          readOnly: current.readOnly,
          bootstrapServers: parseBootstrapServers(current.bootstrapServers),
          useTruststore: !!properties['ssl.truststore.location'],
          schemaRegistry: {
            url: current.schemaRegistry,
            isAuth: !!current.schemaRegistryAuth,
            username: current.schemaRegistryAuth?.username,
            password: current.schemaRegistryAuth?.password,
          },
        };

        if (initialValues.useTruststore) {
          initialValues.truststore = {
            location: properties['ssl.truststore.location'],
            password: properties['ssl.truststore.password'],
          };
        }

        return initialValues;
      }
    }

    return undefined;
  }, [clusterName, config]);

  if (!currentClusterConfig) {
    return null;
  }

  return <WizardForm initialValues={currentClusterConfig} />;
};

export default ClusterConfig;
