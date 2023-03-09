import {
  ApplicationConfigPropertiesKafkaClusters,
  ApplicationConfigPropertiesKafkaSchemaRegistrySsl,
} from 'generated-sources';
import { ClusterConfigFormValues } from 'widgets/ClusterConfigForm/types';

import { convertPropsKeyToFormKey } from './convertPropsKeyToFormKey';

const parseBootstrapServers = (bootstrapServers?: string) =>
  bootstrapServers?.split(',').map((url) => {
    const [host, port] = url.split(':');
    return { host, port };
  });

const parseKeystore = (
  keystore?: ApplicationConfigPropertiesKafkaSchemaRegistrySsl
) => {
  if (!keystore) return undefined;
  const { keystoreLocation, keystorePassword } = keystore;
  return {
    keystore: {
      location: keystoreLocation as string,
      password: keystorePassword as string,
    },
  };
};

const parseCredentials = (username?: string, password?: string) => {
  if (!username || !password) return { isAuth: false };
  return { isAuth: true, username, password };
};

export const getInitialFormData = (
  payload: ApplicationConfigPropertiesKafkaClusters
) => {
  const {
    ssl,
    schemaRegistry,
    schemaRegistryAuth,
    schemaRegistrySsl,
    kafkaConnect,
    metrics,
    ksqldbServer,
    ksqldbServerAuth,
    ksqldbServerSsl,
  } = payload;

  const initialValues: Partial<ClusterConfigFormValues> = {
    name: payload.name as string,
    readOnly: !!payload.readOnly,
    bootstrapServers: parseBootstrapServers(payload.bootstrapServers),
  };

  const { truststoreLocation, truststorePassword } = ssl || {};

  if (truststoreLocation && truststorePassword) {
    initialValues.truststore = {
      location: truststoreLocation,
      password: truststorePassword,
    };
  }

  if (schemaRegistry) {
    initialValues.schemaRegistry = {
      url: schemaRegistry,
      ...parseCredentials(
        schemaRegistryAuth?.username,
        schemaRegistryAuth?.password
      ),
      ...parseKeystore(schemaRegistrySsl),
    };
  }
  if (ksqldbServer) {
    initialValues.ksql = {
      url: ksqldbServer,
      ...parseCredentials(
        ksqldbServerAuth?.username,
        ksqldbServerAuth?.password
      ),
      ...parseKeystore(ksqldbServerSsl),
    };
  }

  if (kafkaConnect && kafkaConnect.length > 0) {
    initialValues.kafkaConnect = kafkaConnect.map((c) => ({
      name: c.name as string,
      address: c.address as string,
      ...parseCredentials(c.username, c.password),
      ...parseKeystore(c),
    }));
  }

  if (metrics) {
    initialValues.metrics = {
      type: metrics.type as string,
      ...parseCredentials(metrics.username, metrics.password),
      ...parseKeystore(metrics),
      port: `${metrics.port}`,
    };
  }

  const properties = payload.properties || {};

  // Authentification
  initialValues.customAuth = {};

  Object.entries(properties).forEach(([key, val]) => {
    if (
      key.startsWith('security.') ||
      key.startsWith('sasl.') ||
      key.startsWith('ssl.')
    ) {
      initialValues.customAuth = {
        ...initialValues.customAuth,
        [convertPropsKeyToFormKey(key)]: val,
      };
    }
  });

  return initialValues as ClusterConfigFormValues;
};
