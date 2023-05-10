package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.ClusterFeature;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ReactiveAdminClient.ClusterDescription;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.acl.AclOperation;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureService {

  private final AdminClientService adminClientService;

  public Mono<List<ClusterFeature>> getAvailableFeatures(ReactiveAdminClient adminClient,
                                                         KafkaCluster cluster,
                                                         ClusterDescription clusterDescription) {
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

    features.add(topicDeletionEnabled(adminClient));
    features.add(aclView(cluster));
    features.add(aclEdit(clusterDescription));

    return Flux.fromIterable(features).flatMap(m -> m).collectList();
  }

  private Mono<ClusterFeature> topicDeletionEnabled(ReactiveAdminClient adminClient) {
    return adminClient.isTopicDeletionEnabled()
        ? Mono.just(ClusterFeature.TOPIC_DELETION)
        : Mono.empty();
  }

  private Mono<ClusterFeature> aclEdit(ClusterDescription clusterDescription) {
    var authorizedOps = Optional.ofNullable(clusterDescription.getAuthorizedOperations()).orElse(Set.of());
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
