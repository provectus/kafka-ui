package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.util.JmxClusterUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.Builder;
import lombok.Value;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.stereotype.Component;

@Component
public class MetricsCache {

  @Value
  @Builder(toBuilder = true)
  public static class Metrics {
    ServerStatusDTO status;
    Throwable lastKafkaException;
    String version;
    List<Feature> features;
    ZookeeperService.ZkStatus zkStatus;
    ReactiveAdminClient.ClusterDescription clusterDescription;
    JmxClusterUtil.JmxMetrics jmxMetrics;
    InternalLogDirStats logDirInfo;
    Map<String, TopicDescription> topicDescriptions;
    Map<String, List<ConfigEntry>> topicConfigs;

    public static Metrics empty() {
      return builder()
          .status(ServerStatusDTO.OFFLINE)
          .version("Unknown")
          .features(List.of())
          .zkStatus(new ZookeeperService.ZkStatus(ServerStatusDTO.OFFLINE, null))
          .clusterDescription(
              new ReactiveAdminClient.ClusterDescription(null, null, List.of(), Set.of()))
          .jmxMetrics(JmxClusterUtil.JmxMetrics.empty())
          .logDirInfo(InternalLogDirStats.empty())
          .topicDescriptions(Map.of())
          .topicConfigs(Map.of())
          .build();
    }
  }

  private final Map<String, Metrics> cache = new ConcurrentHashMap<>();

  public MetricsCache(ClustersStorage clustersStorage) {
    var initializing = Metrics.empty().toBuilder().status(ServerStatusDTO.INITIALIZING).build();
    clustersStorage.getKafkaClusters().forEach(c -> cache.put(c.getName(), initializing));
  }

  public synchronized void replace(KafkaCluster c, Metrics stats) {
    cache.put(c.getName(), stats);
  }

  public synchronized void update(KafkaCluster c,
                                  Map<String, TopicDescription> descriptions,
                                  Map<String, List<ConfigEntry>> configs) {
    var metrics = get(c);
    var updatedDescriptions = new HashMap<>(metrics.getTopicDescriptions());
    updatedDescriptions.putAll(descriptions);
    var updatedConfigs = new HashMap<>(metrics.getTopicConfigs());
    updatedConfigs.putAll(configs);
    replace(
        c,
        metrics.toBuilder()
            .topicDescriptions(updatedDescriptions)
            .topicConfigs(updatedConfigs)
            .build()
    );
  }

  public synchronized void onTopicDelete(KafkaCluster c, String topic) {
    var metrics = get(c);
    var updatedDescriptions = new HashMap<>(metrics.getTopicDescriptions());
    updatedDescriptions.remove(topic);
    var updatedConfigs = new HashMap<>(metrics.getTopicConfigs());
    updatedConfigs.remove(topic);
    replace(
        c,
        metrics.toBuilder()
            .topicDescriptions(updatedDescriptions)
            .topicConfigs(updatedConfigs)
            .build()
    );
  }

  public Metrics get(KafkaCluster c) {
    return Objects.requireNonNull(cache.get(c.getName()), "Unknown cluster metrics requested");
  }

}
