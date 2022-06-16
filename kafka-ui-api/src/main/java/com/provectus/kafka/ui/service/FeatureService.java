package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureService {

  private static final String DELETE_TOPIC_ENABLED_SERVER_PROPERTY = "delete.topic.enable";

  private final AdminClientService adminClientService;

  public Mono<List<Feature>> getAvailableFeatures(KafkaCluster cluster, @Nullable Node controller) {
    List<Mono<Feature>> features = new ArrayList<>();

    if (Optional.ofNullable(cluster.getKafkaConnect())
        .filter(Predicate.not(List::isEmpty))
        .isPresent()) {
      features.add(Mono.just(Feature.KAFKA_CONNECT));
    }

    if (cluster.getKsqldbServer() != null) {
      features.add(Mono.just(Feature.KSQL_DB));
    }

    if (cluster.getSchemaRegistry() != null) {
      features.add(Mono.just(Feature.SCHEMA_REGISTRY));
    }

    if (controller != null) {
      features.add(
          isTopicDeletionEnabled(cluster, controller)
              .flatMap(r -> Boolean.TRUE.equals(r) ? Mono.just(Feature.TOPIC_DELETION) : Mono.empty())
      );
    }

    return Flux.fromIterable(features).flatMap(m -> m).collectList();
  }

  private Mono<Boolean> isTopicDeletionEnabled(KafkaCluster cluster, Node controller) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.loadBrokersConfig(List.of(controller.id())))
        .map(config ->
            config.values().stream()
                .flatMap(Collection::stream)
                .filter(e -> e.name().equals(DELETE_TOPIC_ENABLED_SERVER_PROPERTY))
                .map(e -> Boolean.parseBoolean(e.value()))
                .findFirst()
                .orElse(false));
  }
}
