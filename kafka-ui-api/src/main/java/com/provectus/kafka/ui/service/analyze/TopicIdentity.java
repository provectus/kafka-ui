package com.provectus.kafka.ui.service.analyze;

import com.provectus.kafka.ui.model.KafkaCluster;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@ToString
@EqualsAndHashCode
class TopicIdentity {
  final String clusterName;
  final String topicName;

  public TopicIdentity(KafkaCluster cluster, String topic) {
    this.clusterName = cluster.getName();
    this.topicName = topic;
  }
}
