import { object, string, number, array, boolean, mixed } from 'yup';

const bootstrapServerSchema = object({
  host: string().required('host is a required field'),
  port: number()
    .positive('Port must be a positive number')
    .typeError('Port must be a number')
    .required('Port is a required field'),
});

const formSchema = object({
  name: string()
    .required()
    .min(3, 'Cluster name must be at least 3 characters'),
  readOnly: boolean().required(),
  bootstrapServers: array().of(bootstrapServerSchema).min(1),
  securityProtocol: string().oneOf(['SASL_SSL', 'SASL_PLAINTEXT', 'none']),
  authentication: object({
    type: string()
      .required()
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
    // SASL/JAAS
    saslJaasConfig: string().when('type', {
      is: 'SASL/JAAS',
      then: (schema) => schema.required(),
    }),
    // SASL/GSSAPI
    saslKerberosServiceName: string().when('type', {
      is: 'SASL/GSSAPI',
      then: (schema) => schema.required(),
    }),
    useKeyTab: boolean().when('type', {
      is: 'SASL/GSSAPI',
      then: (schema) => schema.required(),
    }),
    storeKey: boolean().when('type', {
      is: 'SASL/GSSAPI',
      then: (schema) => schema.required(),
    }),
    keyTab: mixed().when('type', {
      is: 'SASL/GSSAPI',
      then: (schema) => schema.required(),
    }),
    principal: string().when('type', {
      is: 'SASL/GSSAPI',
      then: (schema) => schema.required(),
    }),
    // SASL/OAUTHBEARER
    unsecuredLoginStringClaim_sub: string().when('type', {
      is: 'SASL/OAUTHBEARER',
      then: (schema) => schema.required(),
    }),
    // SASL/PLAIN, SASL/SCRAM-256, SASL/SCRAM-512, SASL/LDAP
    username: string().when('type', {
      is: (value: string) => {
        return [
          'SASL/PLAIN',
          'SASL/SCRAM-256',
          'SASL/SCRAM-512',
          'SASL/LDAP',
        ].includes(value);
      },
      then: (schema) => schema.required(),
    }),
    password: string().when('type', {
      is: (value: string) => {
        return [
          'SASL/PLAIN',
          'SASL/SCRAM-256',
          'SASL/SCRAM-512',
          'SASL/LDAP',
        ].includes(value);
      },
      then: (schema) => schema.required(),
    }),
    // Delegation tokens,
    tokenId: string().when('type', {
      is: 'Delegation tokens',
      then: (schema) => schema.required(),
    }),
    tokenValue: string().when('type', {
      is: 'Delegation tokens',
      then: (schema) => schema.required(),
    }),
    // SASL/AWS IAM
    awsProfileName: string().when('type', {
      is: 'SASL/AWS IAM',
      then: (schema) => schema.optional(),
    }),
    // mTLS
    selfSignedCertificate: boolean().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    sslTruststoreLocation: mixed().when(['type', 'selfSignedCertificate'], {
      is: (type: string, selfSignedCertificate: boolean) =>
        type === 'mTLS' && selfSignedCertificate,
      then: (schema) => schema.required(),
    }),
    sslTruststorePassword: string().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    sslKeystoreLocation: mixed().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    sslKeystorePassword: string().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    sslKeyPassword: string().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
  }).required(),
  schemaRegistry: object({
    url: string().required(),
    isAuth: boolean().required(),
    username: string().when('isAuth', {
      is: true,
      then: (schema) => schema.required(),
    }),
    password: string().when('isAuth', {
      is: true,
      then: (schema) => schema.required(),
    }),
  }),
  kafkaConnect: array().of(
    object({
      name: string().required(),
      url: string().required(),
      isAuth: boolean().required(),
      username: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required(),
      }),
      password: string().when('isAuth', {
        is: true,
        then: (schema) => schema.required(),
      }),
    })
  ),
  JMXMetrics: object({
    port: number().positive().required(),
    isAuth: boolean().required(),
    username: string().when('isAuth', {
      is: true,
      then: (schema) => schema.required(),
    }),
    password: string().when('isAuth', {
      is: true,
      then: (schema) => schema.required(),
    }),
    isSSL: boolean().required(),
    truststoreLocation: string().when('isSSL', {
      is: true,
      then: (schema) => schema.required(),
    }),
    truststorePassword: string().when('isSSL', {
      is: true,
      then: (schema) => schema.required(),
    }),
    keystoreLocation: string(),
    keystorePassword: string(),
    keystoreKeyPassword: string(),
  }),
});

export default formSchema;
