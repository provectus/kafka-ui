package com.provectus.kafka.ui.service.acl;

import static org.apache.kafka.common.acl.AclOperation.ALL;
import static org.apache.kafka.common.acl.AclOperation.CREATE;
import static org.apache.kafka.common.acl.AclOperation.DESCRIBE;
import static org.apache.kafka.common.acl.AclOperation.IDEMPOTENT_WRITE;
import static org.apache.kafka.common.acl.AclOperation.READ;
import static org.apache.kafka.common.acl.AclOperation.WRITE;
import static org.apache.kafka.common.acl.AclPermissionType.ALLOW;
import static org.apache.kafka.common.resource.PatternType.LITERAL;
import static org.apache.kafka.common.resource.PatternType.PREFIXED;
import static org.apache.kafka.common.resource.ResourceType.CLUSTER;
import static org.apache.kafka.common.resource.ResourceType.GROUP;
import static org.apache.kafka.common.resource.ResourceType.TOPIC;
import static org.apache.kafka.common.resource.ResourceType.TRANSACTIONAL_ID;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.model.CreateConsumerAclDTO;
import com.provectus.kafka.ui.model.CreateProducerAclDTO;
import com.provectus.kafka.ui.model.CreateStreamAppAclDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.acl.AccessControlEntry;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.resource.Resource;
import org.apache.kafka.common.resource.ResourcePattern;
import org.apache.kafka.common.resource.ResourcePatternFilter;
import org.apache.kafka.common.resource.ResourceType;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class AclsService {

  private final AdminClientService adminClientService;

  public Mono<Void> createAcl(KafkaCluster cluster, AclBinding aclBinding) {
    return adminClientService.get(cluster)
        .flatMap(ac -> createAclsWithLogging(ac, List.of(aclBinding)));
  }

  private Mono<Void> createAclsWithLogging(ReactiveAdminClient ac, Collection<AclBinding> bindings) {
    bindings.forEach(b -> log.info("CREATING ACL: [{}]", AclCsv.createAclString(b)));
    return ac.createAcls(bindings)
        .doOnSuccess(v -> bindings.forEach(b -> log.info("ACL CREATED: [{}]", AclCsv.createAclString(b))));
  }

  public Mono<Void> deleteAcl(KafkaCluster cluster, AclBinding aclBinding) {
    var aclString = AclCsv.createAclString(aclBinding);
    log.info("DELETING ACL: [{}]", aclString);
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.deleteAcls(List.of(aclBinding)))
        .doOnSuccess(v -> log.info("ACL DELETED: [{}]", aclString));
  }

  public Flux<AclBinding> listAcls(KafkaCluster cluster, ResourcePatternFilter filter) {
    return adminClientService.get(cluster)
        .flatMap(c -> c.listAcls(filter))
        .flatMapIterable(acls -> acls)
        .sort(Comparator.comparing(AclBinding::toString));  //sorting to keep stable order on different calls
  }

  public Mono<String> getAclAsCsvString(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(c -> c.listAcls(ResourcePatternFilter.ANY))
        .map(AclCsv::transformToCsvString);
  }

  public Mono<Void> syncAclWithAclCsv(KafkaCluster cluster, String csv) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.listAcls(ResourcePatternFilter.ANY).flatMap(existingAclList -> {
          var existingSet = Set.copyOf(existingAclList);
          var newAcls = Set.copyOf(AclCsv.parseCsv(csv));
          var toDelete = Sets.difference(existingSet, newAcls);
          var toAdd = Sets.difference(newAcls, existingSet);
          logAclSyncPlan(cluster, toAdd, toDelete);
          if (toAdd.isEmpty() && toDelete.isEmpty()) {
            return Mono.empty();
          }
          log.info("Starting new ACLs creation");
          return ac.createAcls(toAdd)
              .doOnSuccess(v -> {
                log.info("{} new ACLs created", toAdd.size());
                log.info("Starting ACLs deletion");
              })
              .then(ac.deleteAcls(toDelete)
                  .doOnSuccess(v -> log.info("{} ACLs deleted", toDelete.size())));
        }));
  }

  private void logAclSyncPlan(KafkaCluster cluster, Set<AclBinding> toBeAdded, Set<AclBinding> toBeDeleted) {
    log.info("'{}' cluster ACL sync plan: ", cluster.getName());
    if (toBeAdded.isEmpty() && toBeDeleted.isEmpty()) {
      log.info("Nothing to do, ACL is already in sync");
      return;
    }
    if (!toBeAdded.isEmpty()) {
      log.info("ACLs to be added ({}): ", toBeAdded.size());
      for (AclBinding aclBinding : toBeAdded) {
        log.info(" " + AclCsv.createAclString(aclBinding));
      }
    }
    if (!toBeDeleted.isEmpty()) {
      log.info("ACLs to be deleted ({}): ", toBeDeleted.size());
      for (AclBinding aclBinding : toBeDeleted) {
        log.info(" " + AclCsv.createAclString(aclBinding));
      }
    }
  }

  // creates allow binding for resources by prefix or specific names list
  private List<AclBinding> createAllowBindings(ResourceType resourceType,
                                               List<AclOperation> opsToAllow,
                                               String principal,
                                               String host,
                                               @Nullable String resourcePrefix,
                                               @Nullable Collection<String> resourceNames) {
    List<AclBinding> bindings = new ArrayList<>();
    if (resourcePrefix != null) {
      for (var op : opsToAllow) {
        bindings.add(
            new AclBinding(
                new ResourcePattern(resourceType, resourcePrefix, PREFIXED),
                new AccessControlEntry(principal, host, op, ALLOW)));
      }
    }
    if (!CollectionUtils.isEmpty(resourceNames)) {
      resourceNames.stream()
          .distinct()
          .forEach(resource ->
              opsToAllow.forEach(op ->
                  bindings.add(
                      new AclBinding(
                          new ResourcePattern(resourceType, resource, LITERAL),
                          new AccessControlEntry(principal, host, op, ALLOW)))));
    }
    return bindings;
  }

  public Mono<Void> createConsumerAcl(KafkaCluster cluster, CreateConsumerAclDTO request) {
    return adminClientService.get(cluster)
        .flatMap(ac -> createAclsWithLogging(ac, createConsumerBindings(request)))
        .then();
  }

  //Read, Describe on topics, Read on consumerGroups
  private List<AclBinding> createConsumerBindings(CreateConsumerAclDTO request) {
    List<AclBinding> bindings = new ArrayList<>();
    bindings.addAll(
        createAllowBindings(TOPIC,
            List.of(READ, DESCRIBE),
            request.getPrincipal(),
            request.getHost(),
            request.getTopicsPrefix(),
            request.getTopics()));

    bindings.addAll(
        createAllowBindings(
            GROUP,
            List.of(READ),
            request.getPrincipal(),
            request.getHost(),
            request.getConsumerGroupsPrefix(),
            request.getConsumerGroups()));
    return bindings;
  }

  public Mono<Void> createProducerAcl(KafkaCluster cluster, CreateProducerAclDTO request) {
    return adminClientService.get(cluster)
        .flatMap(ac -> createAclsWithLogging(ac, createProducerBindings(request)))
        .then();
  }

  //Write, Describe, Create permission on topics, Write, Describe on transactionalIds
  //IDEMPOTENT_WRITE on cluster if idempotent is enabled
  private List<AclBinding> createProducerBindings(CreateProducerAclDTO request) {
    List<AclBinding> bindings = new ArrayList<>();
    bindings.addAll(
        createAllowBindings(
            TOPIC,
            List.of(WRITE, DESCRIBE, CREATE),
            request.getPrincipal(),
            request.getHost(),
            request.getTopicsPrefix(),
            request.getTopics()));

    bindings.addAll(
        createAllowBindings(
            TRANSACTIONAL_ID,
            List.of(WRITE, DESCRIBE),
            request.getPrincipal(),
            request.getHost(),
            request.getTransactionsIdPrefix(),
            Optional.ofNullable(request.getTransactionalId()).map(List::of).orElse(null)));

    if (Boolean.TRUE.equals(request.getIdempotent())) {
      bindings.addAll(
          createAllowBindings(
              CLUSTER,
              List.of(IDEMPOTENT_WRITE),
              request.getPrincipal(),
              request.getHost(),
              null,
              List.of(Resource.CLUSTER_NAME))); // cluster name is a const string in ACL api
    }
    return bindings;
  }

  public Mono<Void> createStreamAppAcl(KafkaCluster cluster, CreateStreamAppAclDTO request) {
    return adminClientService.get(cluster)
        .flatMap(ac -> createAclsWithLogging(ac, createStreamAppBindings(request)))
        .then();
  }

  // Read on input topics, Write on output topics
  // ALL on applicationId-prefixed Groups and Topics
  private List<AclBinding> createStreamAppBindings(CreateStreamAppAclDTO request) {
    List<AclBinding> bindings = new ArrayList<>();
    bindings.addAll(
        createAllowBindings(
            TOPIC,
            List.of(READ),
            request.getPrincipal(),
            request.getHost(),
            null,
            request.getInputTopics()));

    bindings.addAll(
        createAllowBindings(
            TOPIC,
            List.of(WRITE),
            request.getPrincipal(),
            request.getHost(),
            null,
            request.getOutputTopics()));

    bindings.addAll(
        createAllowBindings(
            GROUP,
            List.of(ALL),
            request.getPrincipal(),
            request.getHost(),
            request.getApplicationId(),
            null));

    bindings.addAll(
        createAllowBindings(
            TOPIC,
            List.of(ALL),
            request.getPrincipal(),
            request.getHost(),
            request.getApplicationId(),
            null));
    return bindings;
  }

}
