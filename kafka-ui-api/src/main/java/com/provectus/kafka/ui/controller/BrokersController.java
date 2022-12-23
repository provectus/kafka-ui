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
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
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
  private final BrokerService brokerService;
  private final ClusterMapper clusterMapper;
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<Flux<BrokerDTO>>> getBrokers(String clusterName,
                                                          ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .build());

    var job = brokerService.getBrokers(getCluster(clusterName)).map(clusterMapper::toBrokerDto);

    return validateAccess.thenReturn(ResponseEntity.ok(job));
  }

  @Override
  public Mono<ResponseEntity<BrokerMetricsDTO>> getBrokersMetrics(String clusterName, Integer id,
                                                                  ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .build());

    return validateAccess.then(
        brokerService.getBrokerMetrics(getCluster(clusterName), id)
            .map(clusterMapper::toBrokerMetrics)
            .map(ResponseEntity::ok)
            .onErrorReturn(ResponseEntity.notFound().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokersLogdirsDTO>>> getAllBrokersLogdirs(String clusterName,
                                                                            List<Integer> brokers,
                                                                            ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .build());

    return validateAccess.thenReturn(ResponseEntity.ok(
        brokerService.getAllBrokersLogdirs(getCluster(clusterName), brokers)));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokerConfigDTO>>> getBrokerConfig(String clusterName,
                                                                     Integer id,
                                                                     ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW)
        .build());

    return validateAccess.thenReturn(
        ResponseEntity.ok(
            brokerService.getBrokerConfig(getCluster(clusterName), id)
                .map(clusterMapper::toBrokerConfig))
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerTopicPartitionLogDir(String clusterName,
                                                                     Integer id,
                                                                     Mono<BrokerLogdirUpdateDTO> brokerLogdir,
                                                                     ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW, ClusterConfigAction.EDIT)
        .build());

    return validateAccess.then(
        brokerLogdir
            .flatMap(bld -> brokerService.updateBrokerLogDir(getCluster(clusterName), id, bld))
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerConfigByName(String clusterName,
                                                             Integer id,
                                                             String name,
                                                             Mono<BrokerConfigItemDTO> brokerConfig,
                                                             ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW, ClusterConfigAction.EDIT)
        .build());

    return validateAccess.then(
        brokerConfig
            .flatMap(bci -> brokerService.updateBrokerConfigByName(
                getCluster(clusterName), id, name, bci.getValue()))
            .map(ResponseEntity::ok)
    );
  }
}
