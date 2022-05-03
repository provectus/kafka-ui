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
  saslMechanism: string;
  saslJaasConfig: string;
  sslTruststoreLocation: string;
  sslTruststorePassword: string;
  sslKeystoreLocation: string;
  sslKeystorePassword: string;
  useSpecificIAMProfile: boolean;
  IAMProfile: string;
}
