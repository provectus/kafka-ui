import { object, string, number, array, boolean } from 'yup';

type AuthenticationType = 'None' | 'SASL_SSL' | 'SASL_PLAINTEXT';

const formSchema = object({
  // kafkaCluster: object({
  clusterName: string()
    .required()
    .min(3, 'Cluster name must be at least 3 characters'),
  readOnly: boolean().required(),
  bootstrapServers: array()
    .of(
      object({
        host: string().required(),
        port: number().positive().required(),
      })
    )
    .min(1),
  sharedConfluentCloudCluster: boolean().required(),
  // }).required(),
  authentication: object({
    type: string().required().oneOf(['None', 'SASL_SSL', 'SASL_PLAINTEXT']),
    securedWithSSL: boolean().when('type', {
      is: 'None',
      then: (schema) => schema.required(),
    }),
    selfSignedCertificate: boolean().when(['securedWithSSL', 'type'], {
      is: (securedWithSSL: boolean, type: AuthenticationType) =>
        securedWithSSL || type === 'SASL_SSL',
      then: (schema) => schema.required(),
    }),
    truststoreLocation: string().when('selfSignedCertificate', {
      is: true,
      then: (schema) => schema.required(),
    }),
    truststorePassword: string().when('selfSignedCertificate', {
      is: true,
      then: (schema) => schema.required(),
    }),
    keystoreLocation: string(),
    keystorePassword: string(),
    keystoreKeyPassword: string(),
    SASLMechanism: string()
      .oneOf(['AWS_MSK_IAM', 'SCRAM_SHA_256', 'SCRAM_SHA_512', 'GSSAPI'])
      .when('type', { is: 'SASL_SSL', then: (schema) => schema.required() }),
    specificProfile: boolean().when('SASLMechanism', {
      is: 'AWS_MSK_IAM',
      then: (schema) => schema.required(),
    }),
    profileName: string().when('specificProfile', {
      is: true,
      then: (schema) => schema.required(),
    }),
    saslJaasConfig: string().when('SASLMechanism', {
      is: 'SCRAM_SHA_256' || 'SCRAM_SHA_512' || 'GSSAPI',
      then: (schema) => schema.required(),
    }),
    kerberosServiceName: string().when('SASLMechanism', {
      is: 'GSSAPI',
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
