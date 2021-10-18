package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ClustersStorage {

  private final Map<String, KafkaCluster> kafkaClusters = new ConcurrentHashMap<>();

  private final ClustersProperties clusterProperties;

  private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);

  @PostConstruct
  public void init() {
    for (ClustersProperties.Cluster clusterProperties : clusterProperties.getClusters()) {
      if (kafkaClusters.get(clusterProperties.getName()) != null) {
        throw new IllegalStateException(
            "Application config isn't correct. Two clusters can't have the same name");
      }
      KafkaCluster cluster = clusterMapper.toKafkaCluster(clusterProperties);
      kafkaClusters.put(
          clusterProperties.getName(),
          cluster.toBuilder().metrics(InternalClusterMetrics.empty()).build()
      );
    }
  }

  public Collection<KafkaCluster> getKafkaClusters() {
    return kafkaClusters.values();
  }

  public Optional<KafkaCluster> getClusterByName(String clusterName) {
    return Optional.ofNullable(kafkaClusters.get(clusterName));
  }

  public KafkaCluster setKafkaCluster(String key, KafkaCluster kafkaCluster) {
    this.kafkaClusters.put(key, kafkaCluster);
    return kafkaCluster;
  }

  public void onTopicDeleted(KafkaCluster cluster, String topicToDelete) {
    var topics = Optional.ofNullable(cluster.getMetrics().getTopics())
        .map(HashMap::new)
        .orElseGet(HashMap::new);
    topics.remove(topicToDelete);
    setUpdatedTopics(cluster, topics);
  }

  public void onTopicUpdated(KafkaCluster cluster, InternalTopic updatedTopic) {
    var topics = Optional.ofNullable(cluster.getMetrics().getTopics())
        .map(HashMap::new)
        .orElseGet(HashMap::new);
    topics.put(updatedTopic.getName(), updatedTopic);
    setUpdatedTopics(cluster, topics);
  }

  private void setUpdatedTopics(KafkaCluster cluster, Map<String, InternalTopic> topics) {
    setKafkaCluster(
        cluster.getName(),
        cluster.toBuilder()
            .metrics(
                cluster.getMetrics().toBuilder()
                    .topics(topics)
                    .build())
            .build()
    );
  }

  public Map<String, KafkaCluster> getKafkaClustersMap() {
    return kafkaClusters;
  }
}
