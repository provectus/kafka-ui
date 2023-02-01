package com.provectus.kafka.ui.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import javax.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
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
    String schemaRegistry;
    SchemaRegistryAuth schemaRegistryAuth;
    WebClientSsl schemaRegistrySsl;
    String ksqldbServer;
    KsqldbServerAuth ksqldbServerAuth;
    WebClientSsl ksqldbServerSsl;
    List<ConnectCluster> kafkaConnect;
    MetricsConfigData metrics;
    Properties properties;
    boolean readOnly = false;
    List<SerdeConfig> serde = new ArrayList<>();
    String defaultKeySerde;
    String defaultValueSerde;
    List<Masking> masking = new ArrayList<>();
    long pollingThrottleRate = 0;
  }

  @Data
  public static class MetricsConfigData {
    String type;
    Integer port;
    boolean ssl;
    String username;
    String password;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder(toBuilder = true)
  public static class ConnectCluster {
    String name;
    String address;
    String userName;
    String password;
    String keystoreLocation;
    String keystorePassword;
    String truststoreLocation;
    String truststorePassword;
  }

  @Data
  public static class SchemaRegistryAuth {
    String username;
    String password;
  }

  @Data
  public static class WebClientSsl {
    String keystoreLocation;
    String keystorePassword;
    String truststoreLocation;
    String truststorePassword;
  }

  @Data
  public static class SerdeConfig {
    String name;
    String className;
    String filePath;
    Map<String, Object> properties = new HashMap<>();
    String topicKeysPattern;
    String topicValuesPattern;
  }

  @Data
  @ToString(exclude = "password")
  public static class KsqldbServerAuth {
    String username;
    String password;
  }

  @Data
  public static class Masking {
    Type type;
    List<String> fields = List.of(); //if empty - policy will be applied to all fields
    List<String> pattern = List.of("X", "x", "n", "-"); //used when type=MASK
    String replacement = "***DATA_MASKED***"; //used when type=REPLACE
    String topicKeysPattern;
    String topicValuesPattern;

    public enum Type {
      REMOVE, MASK, REPLACE
    }
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
