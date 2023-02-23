type SecurityProtocol = 'SASL_SSL' | 'SASL_PLAINTEXT';
type BootstrapServer = {
  host: string;
  port: string;
};
type URLWithAuth = {
  url?: string;
  isAuth: boolean;
  username?: string;
  password?: string;
};
type KafkaConnect = {
  name: string;
  address: string;
  isAuth: boolean;
  username?: string;
  password?: string;
};
type Metrics = {
  type: string;
  port: string;
  isAuth: boolean;
  username?: string;
  password?: string;
};

export type ClusterConfigFormValues = {
  name: string;
  readOnly: boolean;
  bootstrapServers: BootstrapServer[];
  truststore?: {
    location: string;
    password: string;
  };
  keystore?: {
    location: string;
    password: string;
  };
  auth?: {
    method: string;
    securityProtocol: SecurityProtocol;
    props: Record<string, string>;
  };
  schemaRegistry?: URLWithAuth;
  ksql?: URLWithAuth;
  properties?: Record<string, string>;
  kafkaConnect?: KafkaConnect[];
  metrics?: Metrics;
  customAuth: Record<string, string>;
};
