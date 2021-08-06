package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.util.Constants.DELETE_TOPIC_ENABLE;

import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class FeatureServiceImpl implements FeatureService {

  private final BrokerService brokerService;

  @Override
  public List<Feature> getAvailableFeatures(KafkaCluster cluster) {
    List<Feature> features = new ArrayList<>();

    if (Optional.ofNullable(cluster.getKafkaConnect())
        .filter(Predicate.not(List::isEmpty))
        .isPresent()) {
      features.add(Feature.KAFKA_CONNECT);
    }

    if (cluster.getKsqldbServer() != null) {
      features.add(Feature.KSQL_DB);
    }

    if (cluster.getSchemaRegistry() != null) {
      features.add(Feature.SCHEMA_REGISTRY);
    }

    if (topicDeletionCheck(cluster)) {
      features.add(Feature.TOPIC_DELETION);
    }

    return features;
  }

  private boolean topicDeletionCheck(KafkaCluster cluster) {
    return brokerService.getController(cluster)
        .map(Node::id)
        .flatMap(broker -> brokerService.getBrokerConfigMap(cluster, broker))
        .map(config -> {
          if (config != null && config.get(DELETE_TOPIC_ENABLE) != null) {
            return Boolean.parseBoolean(config.get(DELETE_TOPIC_ENABLE).getValue());
          }
          return false;
        }).blockOptional().orElse(false);
  }
}
