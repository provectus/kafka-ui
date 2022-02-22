package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.ClustersApi;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
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
  public Mono<ResponseEntity<ClusterMetricsDTO>> getClusterMetrics(String clusterName,
                                                                   ServerWebExchange exchange) {
    return clusterService.getClusterMetrics(getCluster(clusterName))
        .map(ResponseEntity::ok)
        .onErrorReturn(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<ClusterStatsDTO>> getClusterStats(String clusterName,
                                                               ServerWebExchange exchange) {
    return clusterService.getClusterStats(getCluster(clusterName))
        .map(ResponseEntity::ok)
        .onErrorReturn(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<Flux<ClusterDTO>>> getClusters(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusterService.getClusters())));
  }

  @Override
  public Mono<ResponseEntity<ClusterDTO>> updateClusterInfo(String clusterName,
                                                            ServerWebExchange exchange) {
    return clusterService.updateCluster(getCluster(clusterName)).map(ResponseEntity::ok);
  }
}
