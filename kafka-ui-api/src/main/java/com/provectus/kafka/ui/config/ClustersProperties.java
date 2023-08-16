package com.provectus.kafka.ui.config;

import com.provectus.kafka.ui.model.MetricsConfig;
import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;
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

  String internalTopicPrefix;

  Integer adminClientTimeout;

  PollingProperties polling = new PollingProperties();

  @Data
  public static class Cluster {
    String name;
    String bootstrapServers;
    String schemaRegistry;
    SchemaRegistryAuth schemaRegistryAuth;
    KeystoreConfig schemaRegistrySsl;
    String ksqldbServer;
    KsqldbServerAuth ksqldbServerAuth;
    KeystoreConfig ksqldbServerSsl;
    List<ConnectCluster> kafkaConnect;
    MetricsConfigData metrics;
    Map<String, Object> properties;
    boolean readOnly = false;
    List<SerdeConfig> serde;
    String defaultKeySerde;
    String defaultValueSerde;
    List<Masking> masking;
    Long pollingThrottleRate;
    TruststoreConfig ssl;
    AuditProperties audit;
  }

  @Data
  public static class PollingProperties {
    Integer pollTimeoutMs;
    Integer maxPageSize;
    Integer defaultPageSize;
  }

  @Data
  @ToString(exclude = "password")
  public static class MetricsConfigData {
    String type;
    Integer port;
    Boolean ssl;
    String username;
    String password;
    String keystoreLocation;
    String keystorePassword;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder(toBuilder = true)
  @ToString(exclude = {"password", "keystorePassword"})
  public static class ConnectCluster {
    String name;
    String address;
    String username;
    String password;
    String keystoreLocation;
    String keystorePassword;
  }

  @Data
  @ToString(exclude = {"password"})
  public static class SchemaRegistryAuth {
    String username;
    String password;
  }

  @Data
  @ToString(exclude = {"truststorePassword"})
  public static class TruststoreConfig {
    String truststoreLocation;
    String truststorePassword;
  }

  @Data
  public static class SerdeConfig {
    String name;
    String className;
    String filePath;
    Map<String, Object> properties;
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
  @NoArgsConstructor
  @AllArgsConstructor
  @ToString(exclude = {"keystorePassword"})
  public static class KeystoreConfig {
    String keystoreLocation;
    String keystorePassword;
  }

  @Data
  public static class Masking {
    Type type;
    List<String> fields;
    String fieldsNamePattern;
    List<String> maskingCharsReplacement; //used when type=MASK
    String replacement; //used when type=REPLACE
    String topicKeysPattern;
    String topicValuesPattern;

    public enum Type {
      REMOVE, MASK, REPLACE
    }
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AuditProperties {
    String topic;
    Integer auditTopicsPartitions;
    Boolean topicAuditEnabled;
    Boolean consoleAuditEnabled;
    LogLevel level;
    Map<String, String> auditTopicProperties;

    public enum LogLevel {
      ALL,
      ALTER_ONLY //default
    }
  }

  @PostConstruct
  public void validateAndSetDefaults() {
    if (clusters != null) {
      validateClusterNames();
      flattenClusterProperties();
      setMetricsDefaults();
    }
  }

  private void setMetricsDefaults() {
    for (Cluster cluster : clusters) {
      if (cluster.getMetrics() != null && !StringUtils.hasText(cluster.getMetrics().getType())) {
        cluster.getMetrics().setType(MetricsConfig.JMX_METRICS_TYPE);
      }
    }
  }

  private void flattenClusterProperties() {
    for (Cluster cluster : clusters) {
      cluster.setProperties(flattenClusterProperties(null, cluster.getProperties()));
    }
  }

  private Map<String, Object> flattenClusterProperties(@Nullable String prefix,
                                                       @Nullable Map<String, Object> propertiesMap) {
    Map<String, Object> flattened = new HashMap<>();
    if (propertiesMap != null) {
      propertiesMap.forEach((k, v) -> {
        String key = prefix == null ? k : prefix + "." + k;
        if (v instanceof Map<?, ?>) {
          flattened.putAll(flattenClusterProperties(key, (Map<String, Object>) v));
        } else {
          flattened.put(key, v);
        }
      });
    }
    return flattened;
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
