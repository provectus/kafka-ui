package com.provectus.kafka.ui.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("kafka")
@EnableConfigurationProperties
@Data
public class ClustersProperties {

  List<Cluster> clusters = new ArrayList<>();

  @Data
  public static class Cluster {
    String name;
    String bootstrapServers;
    String zookeeper;
    String schemaRegistry;
    String schemaNameTemplate = "%s-value";
    String keySchemaNameTemplate = "%s-key";
    String protobufFile;
    String protobufMessageName;
    List<ConnectCluster> kafkaConnect;
    int jmxPort;
    Properties properties;
    boolean readOnly = false;
    List<StreamApplication> streamApplications;
  }

  @Data
  public static class ConnectCluster {
    String name;
    String address;
  }

  @Getter
  @Setter
  public static class StreamApplication {
    private String applicationId;
    private String topologyUrl;
  }
}
