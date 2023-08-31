package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.ClustersApi;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.ClusterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ClustersController extends AbstractController implements ClustersApi {
  private final ClusterService clusterService;

  @Override
  public Mono<ResponseEntity<Flux<ClusterDTO>>> getClusters(ServerWebExchange exchange) {
    Flux<ClusterDTO> job = Flux.fromIterable(clusterService.getClusters())
        .filterWhen(accessControlService::isClusterAccessible);

    return Mono.just(ResponseEntity.ok(job));
  }

  @Override
  public Mono<ResponseEntity<ClusterMetricsDTO>> getClusterMetrics(String clusterName,
                                                                   ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("getClusterMetrics")
        .build();

    return validateAccess(context)
        .then(
            clusterService.getClusterMetrics(getCluster(clusterName))
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build())
        )
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ClusterStatsDTO>> getClusterStats(String clusterName,
                                                               ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("getClusterStats")
        .build();

    return validateAccess(context)
        .then(
            clusterService.getClusterStats(getCluster(clusterName))
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build())
        )
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<ClusterDTO>> updateClusterInfo(String clusterName,
                                                            ServerWebExchange exchange) {

    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("updateClusterInfo")
        .build();

    return validateAccess(context)
        .then(clusterService.updateCluster(getCluster(clusterName)).map(ResponseEntity::ok))
        .doOnEach(sig -> audit(context, sig));
  }
}
