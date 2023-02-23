import { ClusterConfigFormValues } from 'widgets/ClusterConfigForm/types';
import { ApplicationConfigPropertiesKafkaClustersInner } from 'generated-sources';

import { getJaasConfig } from './getJaasConfig';
import { convertFormKeyToPropsKey } from './convertFormKeyToPropsKey';

export const transformFormDataToPayload = (data: ClusterConfigFormValues) => {
  const config: ApplicationConfigPropertiesKafkaClustersInner = {
    name: data.name,
    bootstrapServers: data.bootstrapServers
      .map(({ host, port }) => `${host}:${port}`)
      .join(','),
    readOnly: data.readOnly,
  };

  if (data.truststore || data.keystore) {
    config.ssl = {
      truststoreLocation: data.truststore?.location,
      truststorePassword: data.truststore?.password,
      keystoreLocation: data.keystore?.location,
      keystorePassword: data.keystore?.password,
    };
  }

  // Schema Registry
  if (data.schemaRegistry) {
    config.schemaRegistry = data.schemaRegistry.url;
    if (data.schemaRegistry.isAuth) {
      config.schemaRegistryAuth = {
        username: data.schemaRegistry.username,
        password: data.schemaRegistry.password,
      };
    }
  }
  // KSQL
  if (data.ksql) {
    config.ksqldbServer = data.ksql.url;
    if (data.ksql.isAuth) {
      config.ksqldbServerAuth = {
        username: data.ksql.username,
        password: data.ksql.password,
      };
    }
  }

  // Kafka Connect
  if (data.kafkaConnect && data.kafkaConnect.length > 0) {
    config.kafkaConnect = data.kafkaConnect.map(
      ({ name, address, isAuth, username, password }) => {
        const connect = { name, address };
        if (isAuth) {
          return {
            ...connect,
            userName: username,
            password,
          };
        }
        return connect;
      }
    );
  }

  // Metrics
  if (data.metrics) {
    config.metrics = {
      type: data.metrics.type,
      port: Number(data.metrics.port),
    };
    if (data.metrics.isAuth) {
      config.metrics.username = data.metrics.username;
      config.metrics.password = data.metrics.password;
    }
  }

  config.properties = {};

  if (data.customAuth) {
    Object.entries(data.customAuth).forEach(([key, val]) => {
      if (data.customAuth[key]) {
        config.properties = {
          ...config.properties,
          [convertFormKeyToPropsKey(key)]: val,
        };
      }
    });
  }

  // Authentication
  if (data.auth) {
    const { method, props, securityProtocol } = data.auth;
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
            useKeytab: props.keyTabFile ? 'true' : 'false',
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
          'sasl.jaas.config': getJaasConfig('SASL/PLAIN', {
            username: props.username,
            password: props.password,
          }),
        };
        break;
      case 'SASL/SCRAM-256':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'SCRAM-SHA-256',
          'sasl.jaas.config': getJaasConfig('SASL/SCRAM-256', {
            username: props.username,
            password: props.password,
          }),
        };
        break;
      case 'SASL/SCRAM-512':
        config.properties = {
          'security.protocol': securityProtocol,
          'sasl.mechanism': 'SCRAM-SHA-512',
          'sasl.jaas.config': getJaasConfig('SASL/SCRAM-512', {
            username: props.username,
            password: props.password,
          }),
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
          'sasl.jaas.config': getJaasConfig('SASL/LDAP', {
            username: props.username,
            password: props.password,
          }),
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
        config.properties = { 'security.protocol': 'SSL' };
        break;
      default:
      // do nothing
    }
  }

  return config;
};
