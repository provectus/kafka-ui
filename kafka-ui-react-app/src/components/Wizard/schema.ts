import { object, string, number, array, boolean, mixed } from 'yup';

// type AuthenticationType = 'None' | 'SASL_SSL' | 'SASL_PLAINTEXT';

const formSchema = object({
  kafkaCluster: object({
    clusterName: string()
      .required()
      .min(3, 'Cluster name must be at least 3 characters'),
    readOnly: boolean().required(),
    bootstrapServers: array()
      .of(
        object({
          host: string().required('host is a required field'),
          port: number().positive().required(),
        })
      )
      .min(1),
    sharedConfluentCloudCluster: boolean().required(),
  }).required(),
  authentication: object({
    type: string()
      .required()
      .oneOf([
        'None',
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
    'sasl.jaas.config': string().when('type', {
      is: 'SASL/JAAS',
      then: (schema) => schema.required(),
    }),
    'sasl.enabled.mechanisms': string().when('type', {
      is: 'SASL/JAAS',
      then: (schema) => schema.required(),
    }),
    // SASL/GSSAPI
    'sasl.kerberos.service.name': string().when('type', {
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
    // SASL/PLAIN, SASL/SCRAM-256, SASL/SCRAM-512, Delegation tokens, SASL/LDAP
    username: string().when('type', {
      is:
        'SASL/PLAIN' ||
        'SASL/SCRAM-256' ||
        'SASL/SCRAM-512' ||
        'Delegation tokens' ||
        'SASL/LDAP',
      then: (schema) => schema.required(),
    }),
    password: string().when('type', {
      is:
        'SASL/PLAIN' ||
        'SASL/SCRAM-256' ||
        'SASL/SCRAM-512' ||
        'Delegation tokens' ||
        'SASL/LDAP',
      then: (schema) => schema.required(),
    }),
    // SASL/AWS IAM
    awsProfileName: string().when('type', {
      is: 'SASL/AWS IAM',
      then: (schema) => schema.required(),
    }),
    // mTLS
    selfSignedCertificate: boolean().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    'ssl.truststore.location': mixed().when(['type', 'selfSignedCertificate'], {
      is: (type: string, selfSignedCertificate: boolean) =>
        type === 'mTLS' && selfSignedCertificate,
      then: (schema) => schema.required(),
    }),
    'ssl.truststore.password': string().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    'ssl.keystore.location': mixed().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    'ssl.keystore.password': string().when('type', {
      is: 'mTLS',
      then: (schema) => schema.required(),
    }),
    'ssl.key.password': string().when('type', {
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
