import { boolean, string } from "yup";

export interface BootstrapServer {
  host: string;
  port: number;
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
  securedWithAuth: boolean;
  authMethod: 'SASL' | 'SSL' | 'IAM';
  saslMechanism?: string;
  saslJaasConfig?: string;
  sslTruststoreLocation?: string;
  sslTruststorePassword?: string;
  sslKeystoreLocation?: string;
  sslKeystorePassword?: string;
  useSpecificIAMProfile: boolean;
  IAMProfile?: string;
  schemaRegistryURL?: string;
  schemaRegistrySecuredWithAuth: boolean;
  schemaRegistryUsername?: string;
  schemaRegistryPassword?: string;
  kafkaConnectURL: string;
  kafkaConnectSecuredWithAuth: boolean;
  kafkaConnectUsername: string;
  kafkaConnectPassword: string;
  jmxMetrics: boolean;
  jmxURL: string;
  jmxSSL: boolean;
  jmxSSLTruststoreLocation?: string;
  jmxSSLTruststorePassword?: string;
  jmxSSLKeystoreLocation?: string;
  jmxSSLKeystorePassword?: string;
  jmxSecuredWithAuth: boolean;
  jmxUsername?: string;
  jmxPassword?: string;

}
