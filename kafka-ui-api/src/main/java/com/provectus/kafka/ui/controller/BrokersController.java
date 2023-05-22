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
import com.provectus.kafka.ui.service.audit.AuditService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
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
  private final BrokerService brokerService;
  private final ClusterMapper clusterMapper;

  private final AuditService auditService;
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<Flux<BrokerDTO>>> getBrokers(String clusterName,
                                                          ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .auditOperation("getBrokers")
        .build();

    var job = brokerService.getBrokers(getCluster(clusterName)).map(clusterMapper::toBrokerDto);
    return accessControlService.validateAccess(context)
        .thenReturn(ResponseEntity.ok(job))
        .doOnEach(sig -> auditService.audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<BrokerMetricsDTO>> getBrokersMetrics(String clusterName, Integer id,
                                                                  ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .auditOperation("getBrokersMetrics")
        .build();

    return accessControlService.validateAccess(context)
        .then(
            brokerService.getBrokerMetrics(getCluster(clusterName), id)
                .map(clusterMapper::toBrokerMetrics)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build())
        )
        .doOnEach(sig -> auditService.audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokersLogdirsDTO>>> getAllBrokersLogdirs(String clusterName,
                                                                            @Nullable List<Integer> brokers,
                                                                            ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .auditOperation("getAllBrokersLogdirs")
        .operationParams(Map.of("brokerIds", brokers == null ? List.of() : brokers))
        .build();
    return accessControlService.validateAccess(context)
        .thenReturn(ResponseEntity.ok(
            brokerService.getAllBrokersLogdirs(getCluster(clusterName), brokers)))
        .doOnEach(sig -> auditService.audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Flux<BrokerConfigDTO>>> getBrokerConfig(String clusterName,
                                                                     Integer id,
                                                                     ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW)
        .auditOperation("getBrokerConfig")
        .operationParams("brokerId", id)
        .build();

    return accessControlService.validateAccess(context).thenReturn(
        ResponseEntity.ok(
            brokerService.getBrokerConfig(getCluster(clusterName), id)
                .map(clusterMapper::toBrokerConfig))
    ).doOnEach(sig -> auditService.audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> updateBrokerTopicPartitionLogDir(String clusterName,
                                                                     Integer id,
                                                                     Mono<BrokerLogdirUpdateDTO> brokerLogdir,
                                                                     ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .clusterConfigActions(ClusterConfigAction.VIEW, ClusterConfigAction.EDIT)
        .auditOperation("updateBrokerTopicPartitionLogDir")
        .operationParams("brokerId", id)
        .build();

    return accessControlService.validateAccess(context).then(
        brokerLogdir
            .flatMap(bld -> brokerService.updateBrokerLogDir(getCluster(clusterName), id, bld))
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> auditService.audit(context, sig));
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
        .auditOperation("updateBrokerConfigByName")
        .operationParams(Map.of("brokerId", id))
        .build();

    return accessControlService.validateAccess(context).then(
        brokerConfig
            .flatMap(bci -> brokerService.updateBrokerConfigByName(
                getCluster(clusterName), id, name, bci.getValue()))
            .map(ResponseEntity::ok)
    ).doOnEach(sig -> auditService.audit(context, sig));
  }
}
