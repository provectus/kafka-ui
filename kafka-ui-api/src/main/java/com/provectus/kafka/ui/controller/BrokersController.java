package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.BrokersApi;
import com.provectus.kafka.ui.model.Broker;
import com.provectus.kafka.ui.model.BrokerMetrics;
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
public class BrokersController implements BrokersApi {
  private final ClusterService clusterService;

  @Override
  public Mono<ResponseEntity<BrokerMetrics>> getBrokersMetrics(String clusterName, Integer id,
                                                               ServerWebExchange exchange) {
    return clusterService.getBrokerMetrics(clusterName, id)
        .map(ResponseEntity::ok)
        .onErrorReturn(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<Flux<Broker>>> getBrokers(String clusterName,
                                                       ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(clusterService.getBrokers(clusterName)));
  }
}
