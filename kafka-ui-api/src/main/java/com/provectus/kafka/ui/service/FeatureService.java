package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.ClusterFeature;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
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

  public Mono<List<ClusterFeature>> getAvailableFeatures(KafkaCluster cluster, @Nullable Node controller) {
    List<Mono<ClusterFeature>> features = new ArrayList<>();

    if (Optional.ofNullable(cluster.getConnectsClients())
        .filter(Predicate.not(Map::isEmpty))
        .isPresent()) {
      features.add(Mono.just(ClusterFeature.KAFKA_CONNECT));
    }

    if (cluster.getKsqlClient() != null) {
      features.add(Mono.just(ClusterFeature.KSQL_DB));
    }

    if (cluster.getSchemaRegistryClient() != null) {
      features.add(Mono.just(ClusterFeature.SCHEMA_REGISTRY));
    }

    if (controller != null) {
      features.add(
          isTopicDeletionEnabled(cluster, controller)
              .flatMap(r -> Boolean.TRUE.equals(r) ? Mono.just(ClusterFeature.TOPIC_DELETION) : Mono.empty())
      );
    }

    features.add(acl(cluster));

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
                .orElse(true));
  }

  private Mono<ClusterFeature> acl(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(
        ac -> ac.getClusterFeatures().contains(SupportedFeature.AUTHORIZED_SECURITY_ENABLED)
            ? Mono.just(ClusterFeature.KAFKA_ACL)
            : Mono.empty()
    );
  }
}
