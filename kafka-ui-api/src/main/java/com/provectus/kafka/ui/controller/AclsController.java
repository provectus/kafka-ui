package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.AclsApi;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.KafkaAclDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.service.acl.AclsService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AclsController extends AbstractController implements AclsApi {

  private final AclsService aclsService;
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<Void>> createAcl(String clusterName, Mono<KafkaAclDTO> kafkaAclDto,
                                              ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .build();

    return accessControlService.validateAccess(context)
        .then(kafkaAclDto)
        .map(ClusterMapper::toAclBinding)
        .flatMap(binding -> aclsService.createAcl(getCluster(clusterName), binding))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteAcl(String clusterName, Mono<KafkaAclDTO> kafkaAclDto,
                                              ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .build();

    return accessControlService.validateAccess(context)
        .then(kafkaAclDto)
        .map(ClusterMapper::toAclBinding)
        .flatMap(binding -> aclsService.deleteAcl(getCluster(clusterName), binding))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Flux<KafkaAclDTO>>> listAcls(String clusterName, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.VIEW)
        .build();

    return accessControlService.validateAccess(context).then(
        Mono.just(
            ResponseEntity.ok(
                aclsService.listAcls(getCluster(clusterName)).map(ClusterMapper::toKafkaAclDto)))
    );
  }

  @Override
  public Mono<ResponseEntity<String>> getAclAsCsv(String clusterName, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.VIEW)
        .build();

    return accessControlService.validateAccess(context).then(
        aclsService.getAclAsCsvString(getCluster(clusterName))
            .map(ResponseEntity::ok)
            .flatMap(Mono::just)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> syncAclsCsv(String clusterName, Mono<String> csvMono, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .build();

    return accessControlService.validateAccess(context)
        .then(csvMono)
        .flatMap(csv -> aclsService.syncAclWithAclCsv(getCluster(clusterName), csv))
        .thenReturn(ResponseEntity.ok().build());
  }
}
