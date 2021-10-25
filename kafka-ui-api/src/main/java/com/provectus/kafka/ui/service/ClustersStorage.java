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

  public KafkaCluster setKafkaCluster(String key, KafkaCluster kafkaCluster) {
    this.kafkaClusters.put(key, kafkaCluster);
    return kafkaCluster;
  }

  public void onTopicDeleted(KafkaCluster cluster, String topicToDelete) {
    var topics = Optional.ofNullable(cluster.getTopics())
        .map(HashMap::new)
        .orElseGet(HashMap::new);
    topics.remove(topicToDelete);
    var updatedCluster = cluster.toBuilder().topics(topics).build();
    setKafkaCluster(cluster.getName(), updatedCluster);
  }

  public void onTopicUpdated(KafkaCluster cluster, InternalTopic updatedTopic) {
    var topics = Optional.ofNullable(cluster.getTopics())
        .map(HashMap::new)
        .orElseGet(HashMap::new);
    topics.put(updatedTopic.getName(), updatedTopic);
    var updatedCluster = cluster.toBuilder().topics(topics).build();
    setKafkaCluster(cluster.getName(), updatedCluster);
  }

  public Map<String, KafkaCluster> getKafkaClustersMap() {
    return kafkaClusters;
  }
}
