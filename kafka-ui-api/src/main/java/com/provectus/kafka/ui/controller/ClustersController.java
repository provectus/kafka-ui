package com.provectus.kafka.ui.controller;


import com.provectus.kafka.ui.api.ClustersApi;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ClusterAction;
import com.provectus.kafka.ui.service.ClusterService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ClustersController extends AbstractController implements ClustersApi {
  private final ClusterService clusterService;
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<Flux<ClusterDTO>>> getClusters(ServerWebExchange exchange) {
    Flux<ClusterDTO> job = Flux.fromIterable(clusterService.getClusters())
        .filterWhen(accessControlService::isClusterAccessible);

    return Mono.just(ResponseEntity.ok(job));
  }

  @Override
  public Mono<ResponseEntity<ClusterMetricsDTO>> getClusterMetrics(String clusterName,
                                                                   ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .build());

    return validateAccess
        .then(
            clusterService.getClusterMetrics(getCluster(clusterName))
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build())
        );
  }

  @Override
  public Mono<ResponseEntity<ClusterStatsDTO>> getClusterStats(String clusterName,
                                                               ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .build());

    return validateAccess
        .then(
            clusterService.getClusterStats(getCluster(clusterName))
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build())
        );
  }

  @Override
  public Mono<ResponseEntity<ClusterDTO>> updateClusterInfo(String clusterName,
                                                            ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .build());

    return validateAccess
        .then(
            clusterService.updateCluster(getCluster(clusterName)).map(ResponseEntity::ok)
        );
  }
}
