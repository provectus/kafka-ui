import { boolean, string } from "yup";


export interface BootstrapServer {
  host: string;
  port: number;
}

export interface BootstrapServerError {
  host: string;
  port: string;
}

export interface FormProps {
  clusterName: string;
  readonly: boolean;
  bootstrapServers: BootstrapServer[];
  sharedConfluentCloudCluster: boolean;
  securedWithSSL: boolean;
  selfSignedCA: boolean;
  selfSignedCATruststoreLocation?: string;
  selfSignedCATruststorePassword?: string;
  authMethod: 'None' | 'SASL' | 'SSL' | 'IAM';
  saslMechanism?: string;
  saslJaasConfig?: string;
  sslTruststoreLocation?: string;
  sslTruststorePassword?: string;
  sslKeystoreLocation?: string;
  sslKeystorePassword?: string;
  useSpecificIAMProfile: boolean;
  IAMProfile?: string;

  schemaRegistryEnabled: boolean;
  schemaRegistryURL?: string;
  schemaRegistrySecuredWithAuth: boolean;
  schemaRegistryUsername?: string;
  schemaRegistryPassword?: string;

  kafkaConnectEnabled: boolean;
  kafkaConnectURL: string;
  kafkaConnectSecuredWithAuth: boolean;
  kafkaConnectUsername: string;
  kafkaConnectPassword: string;

  jmxEnabled: boolean;
  jmxPort: number;
  jmxSSL: boolean;
  jmxSSLTruststoreLocation?: string;
  jmxSSLTruststorePassword?: string;
  jmxSSLKeystoreLocation?: string;
  jmxSSLKeystorePassword?: string;
  jmxSecuredWithAuth: boolean;
  jmxUsername?: string;
  jmxPassword?: string;
}
