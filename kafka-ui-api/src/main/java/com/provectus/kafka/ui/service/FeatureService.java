package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.ClusterFeature;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ReactiveAdminClient.ClusterDescription;
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
import org.apache.kafka.common.acl.AclOperation;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureService {

  private static final String DELETE_TOPIC_ENABLED_SERVER_PROPERTY = "delete.topic.enable";

  private final AdminClientService adminClientService;

  public Mono<List<ClusterFeature>> getAvailableFeatures(KafkaCluster cluster, ClusterDescription clusterDescription) {
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

    features.add(topicDeletionEnabled(cluster, clusterDescription.getController()));
    features.add(aclView(cluster));
    features.add(aclEdit(clusterDescription));

    return Flux.fromIterable(features).flatMap(m -> m).collectList();
  }

  private Mono<ClusterFeature> topicDeletionEnabled(KafkaCluster cluster, @Nullable Node controller) {
    if (controller == null) {
      return Mono.empty();
    }
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.loadBrokersConfig(List.of(controller.id())))
        .map(config ->
            config.values().stream()
                .flatMap(Collection::stream)
                .filter(e -> e.name().equals(DELETE_TOPIC_ENABLED_SERVER_PROPERTY))
                .map(e -> Boolean.parseBoolean(e.value()))
                .findFirst()
                .orElse(true))
        .flatMap(enabled -> enabled ? Mono.just(ClusterFeature.TOPIC_DELETION) : Mono.empty());
  }

  private Mono<ClusterFeature> aclEdit(ClusterDescription clusterDescription) {
    var authorizedOps = clusterDescription.getAuthorizedOperations();
    boolean canEdit = authorizedOps.contains(AclOperation.ALL) || authorizedOps.contains(AclOperation.ALTER);
    return canEdit
        ? Mono.just(ClusterFeature.KAFKA_ACL_EDIT)
        : Mono.empty();
  }

  private Mono<ClusterFeature> aclView(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(
        ac -> ac.getClusterFeatures().contains(ReactiveAdminClient.SupportedFeature.AUTHORIZED_SECURITY_ENABLED)
            ? Mono.just(ClusterFeature.KAFKA_ACL_VIEW)
            : Mono.empty()
    );
  }
}
