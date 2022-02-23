package com.provectus.kafka.ui.config;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import javax.annotation.PostConstruct;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

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

  @PostConstruct
  public void validateAndSetDefaults() {
    validateClusterNames();
  }

  private void validateClusterNames() {
    // if only one cluster provided it is ok not to set name
    if (clusters.size() == 1 && !StringUtils.hasText(clusters.get(0).getName())) {
      clusters.get(0).setName("Default");
      return;
    }

    Set<String> clusterNames = new HashSet<>();
    for (Cluster clusterProperties : clusters) {
      if (!StringUtils.hasText(clusterProperties.getName())) {
        throw new IllegalStateException(
            "Application config isn't valid. "
                + "Cluster names should be provided in case of multiple clusters present");
      }
      if (!clusterNames.add(clusterProperties.getName())) {
        throw new IllegalStateException(
            "Application config isn't valid. Two clusters can't have the same name");
      }
    }
  }
}
