import { object, string, number, array, boolean, mixed, lazy } from 'yup';

const requiredString = string().required('required field');

const bootstrapServerSchema = object({
  host: requiredString,
  port: number()
    .positive('positive only')
    .typeError('numbers only')
    .required('required'),
});

const schemaRegistrySchema = lazy((value) => {
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
    });
  }
  return mixed().optional();
});

const truststoreSchema = lazy((_, { parent }) => {
  if (parent.useTruststore) {
    return object({
      location: requiredString,
      password: requiredString,
    });
  }
  return mixed().optional();
});

const authSchema = lazy((_, { parent }) => {
  switch (parent.authMethod) {
    case 'SASL/JAAS':
      return object({
        saslJaasConfig: requiredString,
        saslEnabledMechanism: requiredString,
      });
    case 'SASL/GSSAPI':
      return object({
        saslKerberosServiceName: requiredString,
        keyTabFile: string(),
        storeKey: boolean().required('required field'),
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
      return object({
        sslKeystoreLocation: requiredString,
        sslKeystorePassword: requiredString,
        sslKeyPassword: requiredString,
      });
    default:
      return mixed().optional();
  }
});

const formSchema = object({
  name: string()
    .required('required field')
    .min(3, 'Cluster name must be at least 3 characters'),
  readOnly: boolean().required('required field'),
  bootstrapServers: array().of(bootstrapServerSchema).min(1),
  useTruststore: boolean(),
  truststore: truststoreSchema,
  authMethod: string()
    .required('required field')
    .oneOf([
      'none',
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
      is: (value: string) => {
        return [
          'SASL/JAAS',
          'SASL/GSSAPI',
          'SASL/OAUTHBEARER',
          'SASL/PLAIN',
          'SASL/SCRAM-256',
          'SASL/SCRAM-512',
          'SASL/LDAP',
          'SASL/AWS IAM',
        ].includes(value);
      },
      then: (schema) => schema.required('required field'),
    }),
  authentication: authSchema,
  schemaRegistry: schemaRegistrySchema,

  kafkaConnect: array().of(
    object({
      name: requiredString,
      url: requiredString,
      isAuth: boolean().required('required field'),
      username: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required('required field'),
      }),
      password: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required('required field'),
      }),
    })
  ),
  metrics: object({
    type: string().oneOf(['none', 'JMX', 'PROMETHEUS']),
    port: number()
      .positive('Port must be a positive number')
      .typeError('Port must be a number')
      .required('Port is a required field'),
    isAuth: boolean().required(),
    username: string().when('isAuth', {
      is: true,
      then: (schema) => schema.required('Field is a required'),
    }),
    password: string().when('isAuth', {
      is: true,
      then: (schema) => schema.required('Field is a required'),
    }),
    isSSL: boolean().required(),
    truststoreLocation: string().when('isSSL', {
      is: true,
      then: (schema) => schema.required('Field is a required'),
    }),
    truststorePassword: string().when('isSSL', {
      is: true,
      then: (schema) => schema.required('Field is a required'),
    }),
    keystoreLocation: string(),
    keystorePassword: string(),
    keystoreKeyPassword: string(),
  }),
});

export default formSchema;
