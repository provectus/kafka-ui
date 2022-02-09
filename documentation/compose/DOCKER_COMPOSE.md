# Descriptions of docker-compose configurations (*.yaml)

1. [kafka-ui.yaml](./kafka-ui.yaml) - Default configuration with 2 kafka clusters with two nodes of Schema Registry, one kafka-connect and a few dummy topics.
2. [kafka-clusters-only.yaml](./kafka-clusters-only.yaml) - A configuration for development purposes, everything besides `kafka-ui` itself (to be run locally).
3. [kafka-ui-ssl.yml](./kafka-ssl.yml) - Connect to Kafka via TLS/SSL
4. [kafka-cluster-sr-auth.yaml](./kafka-cluster-sr-auth.yaml) - Schema registry with authentication.
5. [kafka-ui-auth-context.yaml](./kafka-ui-auth-context.yaml) - Basic (username/password) authentication with custom path (URL) (issue 861).
6. [kafka-ui-connectors.yaml](./kafka-ui-connectors.yaml) - Configuration with different connectors (github-source, s3, sink-activities, source-activities) and Ksql functionality.
7. [kafka-ui-jmx-secured.yml](./kafka-ui-jmx-secured.yml) - Kafka’s JMX with SSL and authentication.
8. [kafka-ui-reverse-proxy.yaml](./kafka-ui-reverse-proxy.yaml) - An example for using the app behind a proxy (like nginx).
9. [kafka-ui-sasl.yaml](./kafka-ui-sasl.yaml) - SASL auth for Kafka.
10. [kafka-ui-traefik-proxy.yaml](./kafka-ui-traefik-proxy.yaml) - Traefik specific proxy configuration.
11. [kafka-ui-zookeeper-ssl.yml](./kafka-ui-zookeeper-ssl.yml) - SSL enabled zookeeper.
