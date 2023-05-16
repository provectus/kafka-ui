import { isArray } from 'lodash';
import { object, string, number, array, boolean, mixed, lazy } from 'yup';

const requiredString = string().required('required field');

const portSchema = number()
  .positive('positive only')
  .typeError('numbers only')
  .required('required');

const bootstrapServerSchema = object({
  host: requiredString,
  port: portSchema,
});

const sslSchema = lazy((value) => {
  if (typeof value === 'object') {
    return object({
      location: string().when('password', {
        is: (v: string) => !!v,
        then: (schema) => schema.required('required field'),
      }),
      password: string(),
    });
  }
  return mixed().optional();
});

const urlWithAuthSchema = lazy((value) => {
  if (typeof value === 'object') {
    return object({
      url: requiredString,
      isAuth: boolean(),
      username: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required('required field'),
      }),
      password: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required('required field'),
      }),
      keystore: sslSchema,
    });
  }
  return mixed().optional();
});

const kafkaConnectSchema = object({
  name: requiredString,
  address: requiredString,
  isAuth: boolean(),
  username: string().when('isAuth', {
    is: true,
    then: (schema) => schema.required('required field'),
  }),
  password: string().when('isAuth', {
    is: true,
    then: (schema) => schema.required('required field'),
  }),
  keystore: sslSchema,
});

const kafkaConnectsSchema = lazy((value) => {
  if (isArray(value)) {
    return array().of(kafkaConnectSchema);
  }
  return mixed().optional();
});

const metricsSchema = lazy((value) => {
  if (typeof value === 'object') {
    return object({
      type: string().oneOf(['JMX', 'PROMETHEUS']).required('required field'),
      port: portSchema,
      isAuth: boolean(),
      username: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required('required field'),
      }),
      password: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required('required field'),
      }),
      keystore: sslSchema,
    });
  }
  return mixed().optional();
});

const authPropsSchema = lazy((_, { parent }) => {
  switch (parent.method) {
    case 'SASL/JAAS':
      return object({
        saslJaasConfig: requiredString,
        saslMechanism: requiredString,
      });
    case 'SASL/GSSAPI':
      return object({
        saslKerberosServiceName: requiredString,
        keyTabFile: string(),
        storeKey: boolean(),
        principal: requiredString,
      });
    case 'SASL/OAUTHBEARER':
      return object({
        unsecuredLoginStringClaim_sub: requiredString,
      });
    case 'SASL/PLAIN':
    case 'SASL/SCRAM-256':
    case 'SASL/SCRAM-512':
    case 'SASL/LDAP':
      return object({
        username: requiredString,
        password: requiredString,
      });
    case 'Delegation tokens':
      return object({
        tokenId: requiredString,
        tokenValue: requiredString,
      });
    case 'SASL/AWS IAM':
      return object({
        awsProfileName: string(),
      });
    case 'mTLS':
    default:
      return mixed().optional();
  }
});

const authSchema = lazy((value) => {
  if (typeof value === 'object') {
    return object({
      method: string()
        .required('required field')
        .oneOf([
          'SASL/JAAS',
          'SASL/GSSAPI',
          'SASL/OAUTHBEARER',
          'SASL/PLAIN',
          'SASL/SCRAM-256',
          'SASL/SCRAM-512',
          'Delegation tokens',
          'SASL/LDAP',
          'SASL/AWS IAM',
          'mTLS',
        ]),
      securityProtocol: string()
        .oneOf(['SASL_SSL', 'SASL_PLAINTEXT'])
        .when('method', {
          is: (v: string) => {
            return [
              'SASL/JAAS',
              'SASL/GSSAPI',
              'SASL/OAUTHBEARER',
              'SASL/PLAIN',
              'SASL/SCRAM-256',
              'SASL/SCRAM-512',
              'SASL/LDAP',
              'SASL/AWS IAM',
            ].includes(v);
          },
          then: (schema) => schema.required('required field'),
        }),
      keystore: lazy((_, { parent }) => {
        if (parent.method === 'mTLS') {
          return object({
            location: requiredString,
            password: string(),
          });
        }
        return mixed().optional();
      }),
      props: authPropsSchema,
    });
  }
  return mixed().optional();
});

const formSchema = object({
  name: string()
    .required('required field')
    .min(3, 'Cluster name must be at least 3 characters'),
  readOnly: boolean().required('required field'),
  bootstrapServers: array().of(bootstrapServerSchema).min(1),
  truststore: sslSchema,
  auth: authSchema,
  schemaRegistry: urlWithAuthSchema,
  ksql: urlWithAuthSchema,
  kafkaConnect: kafkaConnectsSchema,
  metrics: metricsSchema,
});

export default formSchema;
