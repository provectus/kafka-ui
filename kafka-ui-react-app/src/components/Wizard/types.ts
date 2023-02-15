type SecurityProtocol = 'SASL_SSL' | 'SASL_PLAINTEXT';
type BootstrapServer = {
  host: string;
  port: string;
};
type SchemaRegistry = {
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
  schemaRegistry?: SchemaRegistry;
  properties?: Record<string, string>;
  kafkaConnect?: KafkaConnect[];
  metrics?: Metrics;
  customAuth: Record<string, string>;
};
