package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.service.ReactiveAdminClient;
import com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
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
  ScrapedClusterState clusterState;

  public static Statistics empty() {
    return builder()
        .status(ServerStatusDTO.OFFLINE)
        .version("Unknown")
        .features(List.of())
        .clusterDescription(
            new ReactiveAdminClient.ClusterDescription(null, null, List.of(), Set.of()))
        .metrics(Metrics.empty())
        .clusterState(ScrapedClusterState.empty())
        .build();
  }

  public Stream<TopicDescription> topicDescriptions(){
    return clusterState.getTopicStates().values().stream().map(ScrapedClusterState.TopicState::description);
  }

}
