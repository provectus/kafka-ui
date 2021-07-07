package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.ClustersApi;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.ClusterMetrics;
import com.provectus.kafka.ui.model.ClusterStats;
import com.provectus.kafka.ui.service.ClusterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class ClustersController implements ClustersApi {
  private final ClusterService clusterService;

  @Override
  public Mono<ResponseEntity<ClusterMetrics>> getClusterMetrics(String clusterName,
                                                                ServerWebExchange exchange) {
    return clusterService.getClusterMetrics(clusterName)
        .map(ResponseEntity::ok)
        .onErrorReturn(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<ClusterStats>> getClusterStats(String clusterName,
                                                            ServerWebExchange exchange) {
    return clusterService.getClusterStats(clusterName)
        .map(ResponseEntity::ok)
        .onErrorReturn(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<Flux<Cluster>>> getClusters(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusterService.getClusters())));
  }

  @Override
  public Mono<ResponseEntity<Cluster>> updateClusterInfo(String clusterName,
                                                         ServerWebExchange exchange) {
    return clusterService.updateCluster(clusterName).map(ResponseEntity::ok);
  }
}
