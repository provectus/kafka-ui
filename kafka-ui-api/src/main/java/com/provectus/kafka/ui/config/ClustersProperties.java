package com.provectus.kafka.ui.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("kafka")
@Data
public class ClustersProperties {

  List<Cluster> clusters = new ArrayList<>();

  @Data
  public static class Cluster {
    String name;
    String bootstrapServers;
    String zookeeper;
    String schemaRegistry;
    SchemaRegistryAuth schemaRegistryAuth;
    String ksqldbServer;
    String schemaNameTemplate = "%s-value";
    String keySchemaNameTemplate = "%s-key";
    String protobufFile;
    String protobufMessageName;
    Map<String, String> protobufMessageNameByTopic;
    List<ConnectCluster> kafkaConnect;
    int jmxPort;
    boolean jmxSsl;
    String jmxUsername;
    String jmxPassword;
    Properties properties;
    boolean readOnly = false;
    boolean disableLogDirsCollection = false;
  }

  @Data
  public static class ConnectCluster {
    String name;
    String address;
  }

  @Data
  public static class SchemaRegistryAuth {
    String username;
    String password;
  }
}
