import { ClusterConfigFormValues } from 'widgets/ClusterConfigForm/types';
import { ApplicationConfigPropertiesKafkaClusters } from 'generated-sources';

import { getJaasConfig } from './getJaasConfig';
import { convertFormKeyToPropsKey } from './convertFormKeyToPropsKey';

const transformToKeystore = (keystore?: {
  location: string;
  password: string;
}) => {
  if (!keystore || !keystore.location) return undefined;
  return {
    keystoreLocation: keystore.location,
    keystorePassword: keystore.password,
  };
};

const transformToCredentials = (
  isAuth: boolean,
  username?: string,
  password?: string
) => {
  if (!isAuth || !username || !password) return undefined;
  return { username, password };
};

const transformCustomProps = (props: Record<string, string>) => {
  const config: Record<string, string> = {};
  if (!props) return config;

  Object.entries(props).forEach(([key, val]) => {
    if (props[key]) config[convertFormKeyToPropsKey(key)] = val;
  });

  return config;
};

export const transformFormDataToPayload = (data: ClusterConfigFormValues) => {
  const config: ApplicationConfigPropertiesKafkaClusters = {
    name: data.name,
    bootstrapServers: data.bootstrapServers
      .map(({ host, port }) => `${host}:${port}`)
      .join(','),
    readOnly: data.readOnly,
  };

  if (data.truststore) {
    config.ssl = {
      truststoreLocation: data.truststore?.location,
      truststorePassword: data.truststore?.password,
    };
  }

  // Schema Registry
  if (data.schemaRegistry) {
    config.schemaRegistry = data.schemaRegistry.url;
    config.schemaRegistryAuth = transformToCredentials(
      data.schemaRegistry.isAuth,
      data.schemaRegistry.username,
      data.schemaRegistry.password
    );
    config.schemaRegistrySsl = transformToKeystore(
      data.schemaRegistry.keystore
    );
  }

  // KSQL
  if (data.ksql) {
    config.ksqldbServer = data.ksql.url;
    config.ksqldbServerAuth = transformToCredentials(
      data.ksql.isAuth,
      data.ksql.username,
      data.ksql.password
    );
    config.ksqldbServerSsl = transformToKeystore(data.ksql.keystore);
  }

  // Kafka Connect
  if (data.kafkaConnect && data.kafkaConnect.length > 0) {
    config.kafkaConnect = data.kafkaConnect.map(
      ({ name, address, isAuth, username, password, keystore }) => ({
        name,
        address,
        ...transformToKeystore(keystore),
        ...transformToCredentials(isAuth, username, password),
      })
    );
  }

  // Metrics
  if (data.metrics) {
    config.metrics = {
      type: data.metrics.type,
      port: Number(data.metrics.port),
      ...transformToKeystore(data.metrics.keystore),
      ...transformToCredentials(
        data.metrics.isAuth,
        data.metrics.username,
        data.metrics.password
      ),
    };
  }

  config.properties = {
    ...transformCustomProps(data.customAuth),
  };

  // Authentication
  if (data.auth) {
    const { method, props, securityProtocol, keystore } = data.auth;
    switch (method) {
      case 'SASL/JAAS':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.jaas.config': props.saslJaasConfig,
          'sasl.mechanism': props.saslMechanism,
        };
        break;
      case 'SASL/GSSAPI':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'GSSAPI',
          'sasl.kerberos.service.name': props.saslKerberosServiceName,
          'sasl.jaas.config': getJaasConfig('SASL/GSSAPI', {
            useKeyTab: props.keyTabFile ? 'true' : 'false',
            keyTab: props.keyTabFile,
            storeKey: String(!!props.storeKey),
            principal: props.principal,
          }),
        };
        break;
      case 'SASL/OAUTHBEARER':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'OAUTHBEARER',
          'sasl.jaas.config': getJaasConfig('SASL/OAUTHBEARER', {
            unsecuredLoginStringClaim_sub: props.unsecuredLoginStringClaim_sub,
          }),
        };
        break;
      case 'SASL/PLAIN':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'PLAIN',
          'sasl.jaas.config': getJaasConfig(
            'SASL/PLAIN',
            transformToCredentials(
              Boolean(props.isAuth),
              props.username,
              props.password
            ) || {}
          ),
        };
        break;
      case 'SASL/SCRAM-256':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'SCRAM-SHA-256',
          'sasl.jaas.config': getJaasConfig(
            'SASL/SCRAM-256',
            transformToCredentials(
              Boolean(props.isAuth),
              props.username,
              props.password
            ) || {}
          ),
        };
        break;
      case 'SASL/SCRAM-512':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'SCRAM-SHA-512',
          'sasl.jaas.config': getJaasConfig(
            'SASL/SCRAM-512',
            transformToCredentials(
              Boolean(props.isAuth),
              props.username,
              props.password
            ) || {}
          ),
        };
        break;
      case 'Delegation tokens':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.jaas.config': getJaasConfig('Delegation tokens', {
            username: props.tokenId,
            password: props.tokenValue,
            tokenauth: 'true',
          }),
        };
        break;
      case 'SASL/LDAP':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'PLAIN',
          'sasl.jaas.config': getJaasConfig(
            'SASL/LDAP',
            transformToCredentials(
              Boolean(props.isAuth),
              props.username,
              props.password
            ) || {}
          ),
        };
        break;
      case 'SASL/AWS IAM':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'AWS_MSK_IAM',
          'sasl.client.callback.handler.class':
            'software.amazon.msk.auth.iam.IAMClientCallbackHandler',
          'sasl.jaas.config': getJaasConfig('SASL/AWS IAM', {
            awsProfileName: props.awsProfileName,
          }),
        };
        break;
      case 'mTLS':
        config.properties = {
          'security.protocol': 'SSL',
          'ssl.keystore.location': keystore?.location,
          'ssl.keystore.password': keystore?.password,
        };
        break;
      default:
      // do nothing
    }
  }

  return config;
};
