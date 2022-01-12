# Descriptions of docker-compose configurations (*.yaml)

1. [kafka-ui.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui.yaml) - Default configuration with 2 kafka clusters with two nodes of Schema Registry, one kafka-connect and a few dummy topics.
2. [kafka-clusters-only.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-clusters-only.yaml) - A configuration for development purposes, everything besides `kafka-ui` itself (to be run locally).
3. [kafka-cluster-sr-auth.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-cluster-sr-auth.yaml) - Schema registry with authentication.
4. [kafka-ui-auth-context.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-auth-context.yaml) - Basic (username/password) authentication with custom path (URL) (issue 861).
5. [kafka-ui-connectors.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-connectors.yaml) - Configuration with different connectors (github-source, s3, sink-activities, source-activities) and Ksql functionality.
6. [kafka-ui-jmx-secured.yml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-jmx-secured.yml) - Kafka’s JMX with SSL and authentication.
7. [kafka-ui-reverse-proxy.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-reverse-proxy.yaml) - An example for using the app behind a proxy (like nginx).
8. [kafka-ui-sasl.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-sasl.yaml) - SASL auth for Kafka.
9. [kafka-ui-traefik-proxy.yaml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-traefik-proxy.yaml) - Traefik specific proxy configuration.
10. [kafka-ui-zookeeper-ssl.yml](https://github.com/provectus/kafka-ui/blob/master/docker/kafka-ui-zookeeper-ssl.yml) - SSL enabled zookeeper.
