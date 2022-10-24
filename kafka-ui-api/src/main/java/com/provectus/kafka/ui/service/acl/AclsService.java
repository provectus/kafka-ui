package com.provectus.kafka.ui.service.acl;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.acl.AclBinding;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class AclsService {

  private final AdminClientService adminClientService;

  public Mono<Void> createAcl(KafkaCluster cluster, AclBinding aclBinding) {
    var aclString = AclCsv.createAclString(aclBinding);
    log.info("CREATING ACL: [{}]", aclString);
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.createAcls(List.of(aclBinding)))
        .doOnSuccess(v -> log.info("ACL CREATED: [{}]", aclString));
  }

  public Mono<Void> deleteAcl(KafkaCluster cluster, AclBinding aclBinding) {
    var aclString = AclCsv.createAclString(aclBinding);
    log.info("DELETING ACL: [{}]", aclString);
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.deleteAcls(List.of(aclBinding)))
        .doOnSuccess(v -> log.info("ACL DELETED: [{}]", aclString));
  }

  public Flux<AclBinding> listAcls(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(ReactiveAdminClient::listAcls)
        .flatMapIterable(acls -> acls);
  }

  public Mono<String> getAclAsCsvString(KafkaCluster cluster) {
    return adminClientService.get(cluster)
        .flatMap(ReactiveAdminClient::listAcls)
        .map(AclCsv::transformToCsvString);
  }

  public Mono<Void> syncAclWithAclCsv(KafkaCluster cluster, String csv) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.listAcls().flatMap(existingAclList -> {
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

}
