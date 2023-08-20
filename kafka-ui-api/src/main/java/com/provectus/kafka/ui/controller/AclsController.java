package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.AclsApi;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.CreateConsumerAclDTO;
import com.provectus.kafka.ui.model.CreateProducerAclDTO;
import com.provectus.kafka.ui.model.CreateStreamAppAclDTO;
import com.provectus.kafka.ui.model.KafkaAclDTO;
import com.provectus.kafka.ui.model.KafkaAclNamePatternTypeDTO;
import com.provectus.kafka.ui.model.KafkaAclResourceTypeDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.service.acl.AclsService;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.resource.PatternType;
import org.apache.kafka.common.resource.ResourcePatternFilter;
import org.apache.kafka.common.resource.ResourceType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class AclsController extends AbstractController implements AclsApi {

  private final AclsService aclsService;

  @Override
  public Mono<ResponseEntity<Void>> createAcl(String clusterName, Mono<KafkaAclDTO> kafkaAclDto,
                                              ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .operationName("createAcl")
        .build();

    return validateAccess(context)
        .then(kafkaAclDto)
        .map(ClusterMapper::toAclBinding)
        .flatMap(binding -> aclsService.createAcl(getCluster(clusterName), binding))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteAcl(String clusterName, Mono<KafkaAclDTO> kafkaAclDto,
                                              ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .operationName("deleteAcl")
        .build();

    return validateAccess(context)
        .then(kafkaAclDto)
        .map(ClusterMapper::toAclBinding)
        .flatMap(binding -> aclsService.deleteAcl(getCluster(clusterName), binding))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Flux<KafkaAclDTO>>> listAcls(String clusterName,
                                                          KafkaAclResourceTypeDTO resourceTypeDto,
                                                          String resourceName,
                                                          KafkaAclNamePatternTypeDTO namePatternTypeDto,
                                                          ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.VIEW)
        .operationName("listAcls")
        .build();

    var resourceType = Optional.ofNullable(resourceTypeDto)
        .map(ClusterMapper::mapAclResourceTypeDto)
        .orElse(ResourceType.ANY);

    var namePatternType = Optional.ofNullable(namePatternTypeDto)
        .map(ClusterMapper::mapPatternTypeDto)
        .orElse(PatternType.ANY);

    var filter = new ResourcePatternFilter(resourceType, resourceName, namePatternType);

    return validateAccess(context).then(
        Mono.just(
            ResponseEntity.ok(
                aclsService.listAcls(getCluster(clusterName), filter)
                    .map(ClusterMapper::toKafkaAclDto)))
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<String>> getAclAsCsv(String clusterName, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.VIEW)
        .operationName("getAclAsCsv")
        .build();

    return validateAccess(context).then(
        aclsService.getAclAsCsvString(getCluster(clusterName))
            .map(ResponseEntity::ok)
            .flatMap(Mono::just)
            .doOnEach(sig -> audit(context, sig))
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> syncAclsCsv(String clusterName, Mono<String> csvMono, ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .operationName("syncAclsCsv")
        .build();

    return validateAccess(context)
        .then(csvMono)
        .flatMap(csv -> aclsService.syncAclWithAclCsv(getCluster(clusterName), csv))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Void>> createConsumerAcl(String clusterName,
                                                      Mono<CreateConsumerAclDTO> createConsumerAclDto,
                                                      ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .operationName("createConsumerAcl")
        .build();

    return validateAccess(context)
        .then(createConsumerAclDto)
        .flatMap(req -> aclsService.createConsumerAcl(getCluster(clusterName), req))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Void>> createProducerAcl(String clusterName,
                                                      Mono<CreateProducerAclDTO> createProducerAclDto,
                                                      ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .operationName("createProducerAcl")
        .build();

    return validateAccess(context)
        .then(createProducerAclDto)
        .flatMap(req -> aclsService.createProducerAcl(getCluster(clusterName), req))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<Void>> createStreamAppAcl(String clusterName,
                                                       Mono<CreateStreamAppAclDTO> createStreamAppAclDto,
                                                       ServerWebExchange exchange) {
    AccessContext context = AccessContext.builder()
        .cluster(clusterName)
        .aclActions(AclAction.EDIT)
        .operationName("createStreamAppAcl")
        .build();

    return validateAccess(context)
        .then(createStreamAppAclDto)
        .flatMap(req -> aclsService.createStreamAppAcl(getCluster(clusterName), req))
        .doOnEach(sig -> audit(context, sig))
        .thenReturn(ResponseEntity.ok().build());
  }
}
