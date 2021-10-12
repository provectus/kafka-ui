package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.mapper.ClusterMapper;
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
          cluster.toBuilder()
              .topics(new HashMap<>())
              .build()
      );
    }
  }

  public Collection<KafkaCluster> getKafkaClusters() {
    return kafkaClusters.values();
  }

  public Optional<KafkaCluster> getClusterByName(String clusterName) {
    return Optional.ofNullable(kafkaClusters.get(clusterName));
  }

  private KafkaCluster updateTopicInCluster(KafkaCluster cluster, InternalTopic updatedTopic) {
    final Map<String, InternalTopic> topics =
        Optional.ofNullable(cluster.getTopics()).map(
            t -> new HashMap<>(cluster.getTopics())
        ).orElse(new HashMap<>());
    topics.put(updatedTopic.getName(), updatedTopic);
    return cluster.toBuilder().topics(topics).build();
  }

  private KafkaCluster deleteTopicFromCluster(KafkaCluster cluster, String topicToDelete) {
    final Map<String, InternalTopic> topics = new HashMap<>(cluster.getTopics());
    topics.remove(topicToDelete);
    return cluster.toBuilder().topics(topics).build();
  }

  public KafkaCluster setKafkaCluster(String key, KafkaCluster kafkaCluster) {
    this.kafkaClusters.put(key, kafkaCluster);
    return kafkaCluster;
  }

  public KafkaCluster topicDeleted(KafkaCluster cluster, String topic) {
    return setKafkaCluster(cluster.getName(), deleteTopicFromCluster(cluster, topic));
  }

  public KafkaCluster topicUpdated(KafkaCluster cluster, InternalTopic topic) {
    return setKafkaCluster(cluster.getName(), updateTopicInCluster(cluster, topic));
  }

  public Map<String, KafkaCluster> getKafkaClustersMap() {
    return kafkaClusters;
  }
}
