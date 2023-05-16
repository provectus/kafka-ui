package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.Builder;
import lombok.Value;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;

@Value
@Builder(toBuilder = true)
public class Statistics {
  ServerStatusDTO status;
  Throwable lastKafkaException;
  String version;
  List<ClusterFeature> features;
  ReactiveAdminClient.ClusterDescription clusterDescription;
  Metrics metrics;
  InternalLogDirStats logDirInfo;
  Map<String, TopicDescription> topicDescriptions;
  Map<String, List<ConfigEntry>> topicConfigs;

  public static Statistics empty() {
    return builder()
        .status(ServerStatusDTO.OFFLINE)
        .version("Unknown")
        .features(List.of())
        .clusterDescription(
            new ReactiveAdminClient.ClusterDescription(null, null, List.of(), Set.of()))
        .metrics(Metrics.empty())
        .logDirInfo(InternalLogDirStats.empty())
        .topicDescriptions(Map.of())
        .topicConfigs(Map.of())
        .build();
  }
}
