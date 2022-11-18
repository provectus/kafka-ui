# Descriptions of docker-compose configurations (*.yaml)

1. [kafka-ui.yaml](./kafka-ui.yaml) - Default configuration with 2 kafka clusters with two nodes of Schema Registry, one kafka-connect and a few dummy topics.
2. [kafka-ui-arm64.yaml](./kafka-ui-arm64.yaml) - Default configuration for ARM64(Mac M1) architecture with 1 kafka cluster without zookeeper with one node of Schema Registry, one kafka-connect and a few dummy topics.
3. [kafka-clusters-only.yaml](./kafka-clusters-only.yaml) - A configuration for development purposes, everything besides `kafka-ui` itself (to be run locally).
4. [kafka-ui-ssl.yml](./kafka-ssl.yml) - Connect to Kafka via TLS/SSL
5. [kafka-cluster-sr-auth.yaml](./kafka-cluster-sr-auth.yaml) - Schema registry with authentication.
6. [kafka-ui-auth-context.yaml](./kafka-ui-auth-context.yaml) - Basic (username/password) authentication with custom path (URL) (issue 861).
7. [e2e-tests.yaml](./e2e-tests.yaml) - Configuration with different connectors (github-source, s3, sink-activities, source-activities) and Ksql functionality.
8. [kafka-ui-jmx-secured.yml](./kafka-ui-jmx-secured.yml) - Kafka’s JMX with SSL and authentication.
9. [kafka-ui-reverse-proxy.yaml](./kafka-ui-reverse-proxy.yaml) - An example for using the app behind a proxy (like nginx).
10. [kafka-ui-sasl.yaml](./kafka-ui-sasl.yaml) - SASL auth for Kafka.
11. [kafka-ui-traefik-proxy.yaml](./kafka-ui-traefik-proxy.yaml) - Traefik specific proxy configuration.
12. [oauth-cognito.yaml](./oauth-cognito.yaml) - OAuth2 with Cognito
13. [kafka-ui-with-jmx-exporter.yaml](./kafka-ui-with-jmx-exporter.yaml) - A configuration with 2 kafka clusters with enabled prometheus jmx exporters instead of jmx.
14. [kafka-with-zookeeper.yaml](./kafka-with-zookeeper.yaml) - An example for using kafka with zookeeper