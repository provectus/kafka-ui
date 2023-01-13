---
description: Kafka in kraft (zk-less) mode with multiple brokers
---

# Kraft mode + multiple brokers

```yaml
---
version: '2'
services:
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - 8080:8080
    depends_on:
      - kafka0
      - kafka1
      - kafka2
      - schema-registry0
      - kafka-connect0
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka0:29092,kafka1:29092,kafka2:29092
      KAFKA_CLUSTERS_0_METRICS_PORT: 9997
      KAFKA_CLUSTERS_0_SCHEMAREGISTRY: http://schema-registry0:8085
      KAFKA_CLUSTERS_0_KAFKACONNECT_0_NAME: first
      KAFKA_CLUSTERS_0_KAFKACONNECT_0_ADDRESS: http://kafka-connect0:8083

  kafka0:
    image: confluentinc/cp-kafka:7.2.1
    hostname: kafka0
    container_name: kafka0
    ports:
      - 9092:9092
      - 9997:9997
    environment:
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka0:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CLUSTER_ID:
      KAFKA_NODE_ID: 1
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka0:29093,2@kafka1:29093,3@kafka2:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka0:29092,CONTROLLER://kafka0:29093,PLAINTEXT_HOST://0.0.0.0:9092'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka0 -Dcom.sun.management.jmxremote.rmi.port=9997
    volumes:
      - ./scripts/update_run_cluster.sh:/tmp/update_run.sh
      - ./scripts/clusterID:/tmp/clusterID
    command: "bash -c 'if [ ! -f /tmp/update_run.sh ]; then echo \"ERROR: Did you forget the update_run.sh file that came with this docker-compose.yml file?\" && exit 1 ; else /tmp/update_run.sh && /etc/confluent/docker/run ; fi'"

  kafka1:
    image: confluentinc/cp-kafka:7.2.1
    hostname: kafka1
    container_name: kafka1
    environment:
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka1:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_NODE_ID: 2
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka0:29093,2@kafka1:29093,3@kafka2:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka1:29092,CONTROLLER://kafka1:29093,PLAINTEXT_HOST://0.0.0.0:9092'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka1 -Dcom.sun.management.jmxremote.rmi.port=9997
    volumes:
      - ./scripts/update_run_cluster.sh:/tmp/update_run.sh
      - ./scripts/clusterID:/tmp/clusterID
    command: "bash -c 'if [ ! -f /tmp/update_run.sh ]; then echo \"ERROR: Did you forget the update_run.sh file that came with this docker-compose.yml file?\" && exit 1 ; else /tmp/update_run.sh && /etc/confluent/docker/run ; fi'"

  kafka2:
    image: confluentinc/cp-kafka:7.2.1
    hostname: kafka2
    container_name: kafka2
    environment:
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka2:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_NODE_ID: 3
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka0:29093,2@kafka1:29093,3@kafka2:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://kafka2:29092,CONTROLLER://kafka2:29093,PLAINTEXT_HOST://0.0.0.0:9092'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      KAFKA_JMX_PORT: 9997
      KAFKA_JMX_OPTS: -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka1 -Dcom.sun.management.jmxremote.rmi.port=9997
    volumes:
      - ./scripts/update_run_cluster.sh:/tmp/update_run.sh
      - ./scripts/clusterID:/tmp/clusterID
    command: "bash -c 'if [ ! -f /tmp/update_run.sh ]; then echo \"ERROR: Did you forget the update_run.sh file that came with this docker-compose.yml file?\" && exit 1 ; else /tmp/update_run.sh && /etc/confluent/docker/run ; fi'"


  schema-registry0:
    image: confluentinc/cp-schema-registry:7.2.1
    ports:
      - 8085:8085
    depends_on:
      - kafka0
    environment:
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: PLAINTEXT://kafka0:29092
      SCHEMA_REGISTRY_KAFKASTORE_SECURITY_PROTOCOL: PLAINTEXT
      SCHEMA_REGISTRY_HOST_NAME: schema-registry0
      SCHEMA_REGISTRY_LISTENERS: http://schema-registry0:8085

      SCHEMA_REGISTRY_SCHEMA_REGISTRY_INTER_INSTANCE_PROTOCOL: "http"
      SCHEMA_REGISTRY_LOG4J_ROOT_LOGLEVEL: INFO
      SCHEMA_REGISTRY_KAFKASTORE_TOPIC: _schemas

  kafka-connect0:
    image: confluentinc/cp-kafka-connect:7.2.1
    ports:
      - 8083:8083
    depends_on:
      - kafka0
      - schema-registry0
    environment:
      CONNECT_BOOTSTRAP_SERVERS: kafka0:29092
      CONNECT_GROUP_ID: compose-connect-group
      CONNECT_CONFIG_STORAGE_TOPIC: _connect_configs
      CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR: 1
      CONNECT_OFFSET_STORAGE_TOPIC: _connect_offset
      CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR: 1
      CONNECT_STATUS_STORAGE_TOPIC: _connect_status
      CONNECT_STATUS_STORAGE_REPLICATION_FACTOR: 1
      CONNECT_KEY_CONVERTER: org.apache.kafka.connect.storage.StringConverter
      CONNECT_KEY_CONVERTER_SCHEMA_REGISTRY_URL: http://schema-registry0:8085
      CONNECT_VALUE_CONVERTER: org.apache.kafka.connect.storage.StringConverter
      CONNECT_VALUE_CONVERTER_SCHEMA_REGISTRY_URL: http://schema-registry0:8085
      CONNECT_INTERNAL_KEY_CONVERTER: org.apache.kafka.connect.json.JsonConverter
      CONNECT_INTERNAL_VALUE_CONVERTER: org.apache.kafka.connect.json.JsonConverter
      CONNECT_REST_ADVERTISED_HOST_NAME: kafka-connect0
      CONNECT_PLUGIN_PATH: "/usr/share/java,/usr/share/confluent-hub-components,/usr/share/filestream-connectors,/tmp/kfk"
    volumes:
      - /tmp/kfk:/tmp/kfk:ro
      - /tmp/kfk/test.txt:/tmp/kfk/test.txt

  kafka-init-topics:
    image: confluentinc/cp-kafka:7.2.1
    volumes:
      - ./message.json:/data/message.json
    depends_on:
      - kafka0
    command: "bash -c 'echo Waiting for Kafka to be ready... && \
               cub kafka-ready -b kafka0:29092 1 30 && \
               kafka-topics --create --topic second.users --partitions 3 --replication-factor 1 --if-not-exists --bootstrap-server kafka0:29092 && \
               kafka-topics --create --topic second.messages --partitions 2 --replication-factor 1 --if-not-exists --bootstrap-server kafka0:29092 && \
               kafka-topics --create --topic first.messages --partitions 2 --replication-factor 1 --if-not-exists --bootstrap-server kafka0:29092 && \
               kafka-console-producer --bootstrap-server kafka0:29092 --topic second.users < /data/message.json'"

```
