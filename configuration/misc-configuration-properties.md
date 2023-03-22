---
description: Configuration properties for all the things
---

# Misc configuration properties

| Name                                                  | Description                                                                                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SERVER_SERVLET_CONTEXT_PATH`                         | URI basePath                                                                                                                                                     |
| `LOGGING_LEVEL_ROOT`                                  | Setting log level (trace, debug, info, warn, error). Default: info                                                                                               |
| `LOGGING_LEVEL_COM_PROVECTUS`                         | Setting log level (trace, debug, info, warn, error). Default: debug                                                                                              |
| `SERVER_PORT`                                         | Port for the embedded server. Default: `8080`                                                                                                                    |
| `KAFKA_ADMIN-CLIENT-TIMEOUT`                          | Kafka API timeout in ms. Default: `30000`                                                                                                                        |
| `KAFKA_CLUSTERS_0_NAME`                               | Cluster name                                                                                                                                                     |
| `KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS`                   | Address where to connect                                                                                                                                         |
| `KAFKA_CLUSTERS_0_KSQLDBSERVER`                       | KSQL DB server address                                                                                                                                           |
| `KAFKA_CLUSTERS_0_KSQLDBSERVERAUTH_USERNAME`          | KSQL DB server's basic authentication username                                                                                                                   |
| `KAFKA_CLUSTERS_0_KSQLDBSERVERAUTH_PASSWORD`          | KSQL DB server's basic authentication password                                                                                                                   |
| `KAFKA_CLUSTERS_0_KSQLDBSERVERSSL_KEYSTORELOCATION`   | Path to the JKS keystore to communicate to KSQL DB                                                                                                               |
| `KAFKA_CLUSTERS_0_KSQLDBSERVERSSL_KEYSTOREPASSWORD`   | Password of the JKS keystore for KSQL DB                                                                                                                         |
| `KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL`       | Security protocol to connect to the brokers. For SSL connection use "SSL", for plaintext connection don't set this environment variable                          |
| `KAFKA_CLUSTERS_0_SCHEMAREGISTRY`                     | SchemaRegistry's address                                                                                                                                         |
| `KAFKA_CLUSTERS_0_SCHEMAREGISTRYAUTH_USERNAME`        | SchemaRegistry's basic authentication username                                                                                                                   |
| `KAFKA_CLUSTERS_0_SCHEMAREGISTRYAUTH_PASSWORD`        | SchemaRegistry's basic authentication password                                                                                                                   |
| `KAFKA_CLUSTERS_0_SCHEMAREGISTRYSSL_KEYSTORELOCATION` | Path to the JKS keystore to communicate to SchemaRegistry                                                                                                        |
| `KAFKA_CLUSTERS_0_SCHEMAREGISTRYSSL_KEYSTOREPASSWORD` | Password of the JKS keystore for SchemaRegistry                                                                                                                  |
| `KAFKA_CLUSTERS_0_METRICS_SSL`                        | Enable SSL for Metrics (for PROMETHEUS metrics type). Default: false.                                                                                            |
| `KAFKA_CLUSTERS_0_METRICS_USERNAME`                   | Username for Metrics authentication                                                                                                                              |
| `KAFKA_CLUSTERS_0_METRICS_PASSWORD`                   | Password for Metrics authentication                                                                                                                              |
| `KAFKA_CLUSTERS_0_METRICS_KEYSTORELOCATION`           | Path to the JKS keystore to communicate to metrics source (JMX/PROMETHEUS). For advanced setup, see `kafka-ui-jmx-secured.yml`                                   |
| `KAFKA_CLUSTERS_0_METRICS_KEYSTOREPASSWORD`           | Password of the JKS metrics keystore                                                                                                                             |
| `KAFKA_CLUSTERS_0_SCHEMANAMETEMPLATE`                 | How keys are saved to schemaRegistry                                                                                                                             |
| `KAFKA_CLUSTERS_0_METRICS_PORT`                       | Open metrics port of a broker                                                                                                                                    |
| `KAFKA_CLUSTERS_0_METRICS_TYPE`                       | Type of metrics retriever to use. Valid values are JMX (default) or PROMETHEUS. If Prometheus, then metrics are read from prometheus-jmx-exporter instead of jmx |
| `KAFKA_CLUSTERS_0_READONLY`                           | Enable read-only mode. Default: false                                                                                                                            |
| `KAFKA_CLUSTERS_0_KAFKACONNECT_0_NAME`                | Given name for the Kafka Connect cluster                                                                                                                         |
| `KAFKA_CLUSTERS_0_KAFKACONNECT_0_ADDRESS`             | Address of the Kafka Connect service endpoint                                                                                                                    |
| `KAFKA_CLUSTERS_0_KAFKACONNECT_0_USERNAME`            | Kafka Connect cluster's basic authentication username                                                                                                            |
| `KAFKA_CLUSTERS_0_KAFKACONNECT_0_PASSWORD`            | Kafka Connect cluster's basic authentication password                                                                                                            |
| `KAFKA_CLUSTERS_0_KAFKACONNECT_0_KEYSTORELOCATION`    | Path to the JKS keystore to communicate to Kafka Connect                                                                                                         |
| `KAFKA_CLUSTERS_0_KAFKACONNECT_0_KEYSTOREPASSWORD`    | Password of the JKS keystore for Kafka Connect                                                                                                                   |
| `KAFKA_CLUSTERS_0_POLLING_THROTTLE_RATE`              | Max traffic rate (bytes/sec) that kafka-ui allowed to reach when polling messages from the cluster. Default: 0 (not limited)                                     |
| `KAFKA_CLUSTERS_0_SSL_TRUSTSTORELOCATION`             | Path to the JKS truststore to communicate to Kafka Connect, SchemaRegistry, KSQL, Metrics                                                                        |
| `KAFKA_CLUSTERS_0_SSL_TRUSTSTOREPASSWORD`             | Password of the JKS truststore for Kafka Connect, SchemaRegistry, KSQL, Metrics                                                                                  |
| `TOPIC_RECREATE_DELAY_SECONDS`                        | Time delay between topic deletion and topic creation attempts for topic recreate functionality. Default: 1                                                       |
| `TOPIC_RECREATE_MAXRETRIES`                           | Number of attempts of topic creation after topic deletion for topic recreate functionality. Default: 15                                                          |
| `DYNAMIC_CONFIG_ENABLED`                              | Allow to change application config in runtime. Default: false.                                                                                                   |
| kafka\_clusters\_internalTopicPrefix                  | Set a prefix for internal topics. Defaults to "\_".                                                                                                              |
