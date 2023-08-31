package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.BrokersApi;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.BrokerConfigDTO;
import com.provectus.kafka.ui.model.BrokerConfigItemDTO;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.BrokerLogdirUpdateDTO;
import com.provectus.kafka.ui.model.BrokerMetricsDTO;
import com.provectus.kafka.ui.model.BrokersLogdirsDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.service.BrokerService;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
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
public class BrokersController extends AbstractController implements BrokersApi {
  private static final String BROKER_ID = "brokerId";

  private final BrokerService brokerService;
  private final ClusterMapper clusterMapper;

  @Override
  public Mono<ResponseEntity<Flux<BrokerDTO>>> getBrokers(String clusterName,
                                                          ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("getBrokers")
        .build();

    var job = brokerService.getBrokers(getCluster(clusterName)).map(clusterMapper::toBrokerDto);
    return validateAccess(context)
        .thenReturn(ResponseEntity.ok(job))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<BrokerMetricsDTO>> getBrokersMetrics(String clusterName, Integer id,
                                                                  ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("getBrokersMetrics")
        .operationParams(Map.of("id", id))
        .build();

    return validateAccess(context)
        .then(
            brokerService.getBrokerMetrics(getCluster(clusterName), id)
                .map(clusterMapper::toBrokerMetrics)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build())
        )
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokersLogdirsDTO>>> getAllBrokersLogdirs(String clusterName,
                                                                            @Nullable List<Integer> brokers,
                                                                            ServerWebExchange exchange) {

    List<Integer> brokerIds = brokers == null ? List.of() : brokers;

    var context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("getAllBrokersLogdirs")
        .operationParams(Map.of("brokerIds", brokerIds))
        .build();

    return validateAccess(context)
        .thenReturn(ResponseEntity.ok(
            brokerService.getAllBrokersLogdirs(getCluster(clusterName), brokerIds)))
        .doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokerConfigDTO>>> getBrokerConfig(String clusterName,
                                                                     Integer id,
                                                                     ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW)
        .operationName("getBrokerConfig")
        .operationParams(Map.of(BROKER_ID, id))
        .build();

    return validateAccess(context).thenReturn(
        ResponseEntity.ok(
            brokerService.getBrokerConfig(getCluster(clusterName), id)
                .map(clusterMapper::toBrokerConfig))
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerTopicPartitionLogDir(String clusterName,
                                                                     Integer id,
                                                                     Mono<BrokerLogdirUpdateDTO> brokerLogdir,
                                                                     ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW, ClusterConfigAction.EDIT)
        .operationName("updateBrokerTopicPartitionLogDir")
        .operationParams(Map.of(BROKER_ID, id))
        .build();

    return validateAccess(context).then(
        brokerLogdir
            .flatMap(bld -> brokerService.updateBrokerLogDir(getCluster(clusterName), id, bld))
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerConfigByName(String clusterName,
                                                             Integer id,
                                                             String name,
                                                             Mono<BrokerConfigItemDTO> brokerConfig,
                                                             ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW, ClusterConfigAction.EDIT)
        .operationName("updateBrokerConfigByName")
        .operationParams(Map.of(BROKER_ID, id))
        .build();

    return validateAccess(context).then(
        brokerConfig
            .flatMap(bci -> brokerService.updateBrokerConfigByName(
                getCluster(clusterName), id, name, bci.getValue()))
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }
}
