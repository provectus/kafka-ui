package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.BrokersApi;
import com.provectus.kafka.ui.model.BrokerConfigDTO;
import com.provectus.kafka.ui.model.BrokerConfigItemDTO;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.BrokerLogdirUpdateDTO;
import com.provectus.kafka.ui.model.BrokerMetricsDTO;
import com.provectus.kafka.ui.model.BrokersLogdirsDTO;
import com.provectus.kafka.ui.service.ClusterService;
import java.util.List;
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
  public Mono<ResponseEntity<BrokerMetricsDTO>> getBrokersMetrics(String clusterName, Integer id,
                                                               ServerWebExchange exchange) {
    return clusterService.getBrokerMetrics(clusterName, id)
        .map(ResponseEntity::ok)
        .onErrorReturn(ResponseEntity.notFound().build());
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokerDTO>>> getBrokers(String clusterName,
                                                       ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(clusterService.getBrokers(clusterName)));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokersLogdirsDTO>>> getAllBrokersLogdirs(String clusterName,
                                                                         List<Integer> brokers,
                                                                         ServerWebExchange exchange
  ) {
    return Mono.just(ResponseEntity.ok(clusterService.getAllBrokersLogdirs(clusterName, brokers)));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokerConfigDTO>>> getBrokerConfig(String clusterName, Integer id,
                                                                  ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(clusterService.getBrokerConfig(clusterName, id)));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerTopicPartitionLogDir(
      String clusterName, Integer id, Mono<BrokerLogdirUpdateDTO> brokerLogdir,
      ServerWebExchange exchange) {
    return brokerLogdir
        .flatMap(bld -> clusterService.updateBrokerLogDir(clusterName, id, bld))
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerConfigByName(String clusterName,
                                                             Integer id,
                                                             String name,
                                                             Mono<BrokerConfigItemDTO> brokerConfig,
                                                             ServerWebExchange exchange) {
    return brokerConfig
        .flatMap(bci -> clusterService.updateBrokerConfigByName(
            clusterName, id, name, bci.getValue()))
        .map(ResponseEntity::ok);
  }
}
