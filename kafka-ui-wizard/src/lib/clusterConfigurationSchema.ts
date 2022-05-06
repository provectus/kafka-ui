import { array, boolean, number, object, string } from 'yup';

export const bootstrapServersSchema = object({
  host: string().label('host').required('required'),
  port: number().max(65535, '65535 is the max').positive('positive only').required('required'),
})

export default object({
  clusterName: string().label('Cluster name').required().min(3),
  readonly: boolean().required().default(false),
  bootstrapServers: array().of(bootstrapServersSchema).min(1).required(),
  sharedConfluentCloudCluster: boolean().required().default(false),
  securedWithSSL: boolean().required().default(false),
  selfSignedCA: boolean().required().default(false),
  selfSignedCATruststoreLocation: string()
    .label('Truststore location').trim().when(
    'selfSignedCA', {
      is: true,
      then: (s) => s.required(),
    }),
  selfSignedCATruststorePassword: string()
    .label('Truststore password').trim().when(
    'selfSignedCA', {
      is: true,
      then: (s) => s.required(),
    }),
  authMethod: string().required().oneOf(['None', 'SASL', 'SSL', 'IAM']),
  saslMechanism: string().label('sasl_mechanism').when(
    'authMethod', {
      is: 'SASL',
      then: (s) => s.required(),
    }),
  saslJaasConfig: string().label('sasl.jaas.config').when(
    'authMethod', {
      is: 'SASL',
      then: (s) => s.required(),
    }),
  sslTruststoreLocation: string().label('Truststore location').when(
    'authMethod', {
      is: 'SSL',
      then: (s) => s.required(),
    }),
  sslTruststorePassword: string().label('Truststore password').when(
    'authMethod', {
      is: 'SSL',
      then: (s) => s.required(),
    }),
  sslKeystoreLocation: string().label('Keystore location').when(
    'authMethod', {
      is: 'SSL',
      then: (s) => s.required(),
    }),
  sslKeystorePassword: string().label('Keystore password').when(
    'authMethod', {
      is: 'SSL',
      then: (s) => s.required(),
    }),
  useSpecificIAMProfile: boolean().when(
    'authMethod', {
      is: 'IAM',
      then: (s) => s.required(),
    }),
  IAMProfile: string().label('Profile Name').when(
    'useSpecificIAMProfile', {
      is: true,
      then: (s) => s.required(),
    }),

  schemaRegistryEnabled: boolean().required(),
  schemaRegistryURL: string().label('URL').when(
    'schemaRegistryEnabled', {
      is: true,
      then: (s) => s.required(),
    }),
  schemaRegistrySecuredWithAuth: boolean().when(
    'schemaRegistryEnabled', {
      is: true,
      then: (s) => s.required(),
    }),
  schemaRegistryUsername: string().label('Username').when(
    'schemaRegistrySecuredWithAuth', {
      is: true,
      then: (s) => s.required(),
    }),
  schemaRegistryPassword: string().label('Password').when(
    'schemaRegistrySecuredWithAuth', {
      is: true,
      then: (s) => s.required(),
    }),

  kafkaConnectEnabled: boolean().required(),
  kafkaConnectURL: string().label('URL').when(
    'kafkaConnectEnabled', {
      is: true,
      then: (s) => s.required(),
    }),
  kafkaConnectSecuredWithAuth: boolean().when(
    'kafkaConnectEnabled', {
      is: true,
      then: (s) => s.required(),
    }),
  kafkaConnectUsername: string().label('Username').when(
    'kafkaConnectSecuredWithAuth', {
      is: true,
      then: (s) => s.required(),
    }),
  kafkaConnectPassword: string().label('Password').when(
    'kafkaConnectSecuredWithAuth', {
      is: true,
      then: (s) => s.required(),
    }),

  jmxEnabled: boolean().required(),
  jmxPort: number().label('Port').when(
    'jmxEnabled', {
      is: true,
      then: number().max(65535, '65535 is the max').positive('positive only').required('required'),
    }),
  jmxSSL: boolean().when(
    'jmxEnabled', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxSSLTruststoreLocation: string().label('Truststore location').when(
    'jmxSSL', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxSSLTruststorePassword: string().label('Truststore password').when(
    'jmxSSL', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxSSLKeystoreLocation: string().label('Keystore location').when(
    'jmxSSL', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxSSLKeystorePassword: string().label('Keystore password').when(
    'jmxSSL', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxSecuredWithAuth: boolean().when(
    'jmxEnabled', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxUsername: string().label('Username').when(
    'jmxSecuredWithAuth', {
      is: true,
      then: (s) => s.required(),
    }),
  jmxPassword: string().label('Password').when(
    'jmxSecuredWithAuth', {
      is: true,
      then: (s) => s.required(),
    }),
});
