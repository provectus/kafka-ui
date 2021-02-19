package com.provectus.kafka.ui;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.Network;

public class KafkaConnectContainer extends GenericContainer<KafkaConnectContainer> {
    private static final int CONNECT_PORT = 8083;

    public KafkaConnectContainer(String version) {
        super("confluentinc/cp-kafka-connect:" + version);
    }


    public KafkaConnectContainer withKafka(KafkaContainer kafka) {
        String bootstrapServers = kafka.getNetworkAliases().get(0) + ":9092";
        return withKafka(kafka.getNetwork(), bootstrapServers);
    }

    public KafkaConnectContainer withKafka(Network network, String bootstrapServers) {
        withNetwork(network);
        withEnv("CONNECT_BOOTSTRAP_SERVERS", "PLAINTEXT://" + bootstrapServers);
        withEnv("CONNECT_GROUP_ID", "connect-group");
        withEnv("CONNECT_CONFIG_STORAGE_TOPIC", "_connect_configs");
        withEnv("CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR", "1");
        withEnv("CONNECT_OFFSET_STORAGE_TOPIC", "_connect_offset");
        withEnv("CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR", "1");
        withEnv("CONNECT_STATUS_STORAGE_TOPIC", "_connect_status");
        withEnv("CONNECT_STATUS_STORAGE_REPLICATION_FACTOR", "1");
        withEnv("CONNECT_KEY_CONVERTER", "org.apache.kafka.connect.storage.StringConverter");
        withEnv("CONNECT_VALUE_CONVERTER", "org.apache.kafka.connect.storage.StringConverter");
        withEnv("CONNECT_INTERNAL_KEY_CONVERTER", "org.apache.kafka.connect.json.JsonConverter");
        withEnv("CONNECT_INTERNAL_VALUE_CONVERTER", "org.apache.kafka.connect.json.JsonConverter");
        withEnv("CONNECT_REST_ADVERTISED_HOST_NAME", "kafka-connect");
        withEnv("CONNECT_PLUGIN_PATH", "/usr/share/java,/usr/share/confluent-hub-components");
        return self();
    }

    public KafkaConnectContainer withSchemaRegistry(SchemaRegistryContainer schemaRegistry) {
        withEnv("SCHEMA_REGISTRY_HOST_NAME", SchemaRegistryContainer.HOST_NAME);
        withEnv("SCHEMA_REGISTRY_LISTENERS", schemaRegistry.getTarget());
        return self();
    }

    public String getTarget() {
        return "http://" + getContainerIpAddress() + ":" + getMappedPort(CONNECT_PORT);
    }
}
