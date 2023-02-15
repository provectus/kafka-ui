import { ApplicationConfigPropertiesKafkaClustersInner } from 'generated-sources';
import { ClusterConfigFormValues } from 'components/Wizard/types';

const parseBootstrapServers = (bootstrapServers?: string) =>
  bootstrapServers?.split(',').map((url) => {
    const [host, port] = url.split(':');
    return { host, port };
  });

export const getInitialFormData = (
  payload: ApplicationConfigPropertiesKafkaClustersInner
) => {
  const { ssl, schemaRegistry, schemaRegistryAuth, kafkaConnect, metrics } =
    payload;

  const initialValues: Partial<ClusterConfigFormValues> = {
    name: payload.name as string,
    readOnly: !!payload.readOnly,
    bootstrapServers: parseBootstrapServers(payload.bootstrapServers),
  };

  const {
    truststoreLocation,
    truststorePassword,
    keystoreLocation,
    keystorePassword,
  } = ssl || {};

  if (truststoreLocation && truststorePassword) {
    initialValues.truststore = {
      location: truststoreLocation,
      password: truststorePassword,
    };
  }
  if (keystoreLocation && keystorePassword) {
    initialValues.keystore = {
      location: keystoreLocation,
      password: keystorePassword,
    };
  }

  if (schemaRegistry) {
    initialValues.schemaRegistry = {
      url: schemaRegistry,
      isAuth: !!schemaRegistryAuth,
      username: schemaRegistryAuth?.username,
      password: schemaRegistryAuth?.password,
    };
  }

  if (kafkaConnect && kafkaConnect.length > 0) {
    initialValues.kafkaConnect = kafkaConnect.map(
      ({ name, address, userName, password }) => ({
        name: name as string,
        address: address as string,
        isAuth: !!userName && !!password,
        username: userName,
        password,
      })
    );
  }

  if (metrics) {
    initialValues.metrics = {
      type: metrics.type as string,
      isAuth: !!metrics.username && !!metrics.password,
      username: metrics.username,
      password: metrics.password,
      port: `${metrics.port}`,
    };
  }

  // Authentification
  // const properties = payload.properties || {};

  return initialValues;
};
