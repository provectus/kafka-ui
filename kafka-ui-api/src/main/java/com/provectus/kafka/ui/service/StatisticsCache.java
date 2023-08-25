package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.InternalPartitionsOffsets;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.model.Statistics;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.stereotype.Component;

@Component
public class StatisticsCache {

  private final Map<String, Statistics> cache = new ConcurrentHashMap<>();

  public StatisticsCache(ClustersStorage clustersStorage) {
    var initializing = Statistics.empty().toBuilder().status(ServerStatusDTO.INITIALIZING).build();
    clustersStorage.getKafkaClusters().forEach(c -> cache.put(c.getName(), initializing));
  }

  public synchronized void replace(KafkaCluster c, Statistics stats) {
    cache.put(c.getName(), stats);
  }

  public synchronized void update(KafkaCluster c,
                                  Map<String, TopicDescription> descriptions,
                                  Map<String, List<ConfigEntry>> configs,
                                  InternalPartitionsOffsets partitionsOffsets) {
    var stats = get(c);
    replace(
        c,
        stats.toBuilder()
            .clusterState(stats.getClusterState().updateTopics(descriptions, configs, partitionsOffsets))
            .build()
    );
  }

  public synchronized void onTopicDelete(KafkaCluster c, String topic) {
    var stats = get(c);
    replace(
        c,
        stats.toBuilder()
            .clusterState(stats.getClusterState().topicDeleted(topic))
            .build()
    );
  }

  public Statistics get(KafkaCluster c) {
    return Objects.requireNonNull(cache.get(c.getName()), "Statistics for unknown cluster requested");
  }

}
