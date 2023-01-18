package com.provectus.kafka.ui.service.acl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.Collection;
import java.util.List;
import org.apache.kafka.common.acl.AccessControlEntry;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.acl.AclPermissionType;
import org.apache.kafka.common.resource.PatternType;
import org.apache.kafka.common.resource.ResourcePattern;
import org.apache.kafka.common.resource.ResourceType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import reactor.core.publisher.Mono;

class AclsServiceTest {

  private static final KafkaCluster CLUSTER = KafkaCluster.builder().build();

  private final ReactiveAdminClient adminClientMock = mock(ReactiveAdminClient.class);
  private final AdminClientService adminClientService = mock(AdminClientService.class);

  private final AclsService aclsService = new AclsService(adminClientService);

  @BeforeEach
  void initMocks() {
    when(adminClientService.get(CLUSTER)).thenReturn(Mono.just(adminClientMock));
  }

  @Test
  void testSyncAclWithAclCsv() {
    var existingBinding1 = new AclBinding(
        new ResourcePattern(ResourceType.TOPIC, "*", PatternType.LITERAL),
        new AccessControlEntry("User:test1", "*", AclOperation.READ, AclPermissionType.ALLOW));

    var existingBinding2 = new AclBinding(
        new ResourcePattern(ResourceType.GROUP, "group1", PatternType.PREFIXED),
        new AccessControlEntry("User:test2", "localhost", AclOperation.DESCRIBE, AclPermissionType.DENY));

    var newBindingToBeAdded = new AclBinding(
        new ResourcePattern(ResourceType.GROUP, "groupNew", PatternType.PREFIXED),
        new AccessControlEntry("User:test3", "localhost", AclOperation.DESCRIBE, AclPermissionType.DENY));

    when(adminClientMock.listAcls())
        .thenReturn(Mono.just(List.of(existingBinding1, existingBinding2)));

    ArgumentCaptor<?> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls((Collection<AclBinding>) createdCaptor.capture()))
        .thenReturn(Mono.empty());

    ArgumentCaptor<?> deletedCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.deleteAcls((Collection<AclBinding>) deletedCaptor.capture()))
        .thenReturn(Mono.empty());

    aclsService.syncAclWithAclCsv(
        CLUSTER,
        "Principal,ResourceType, PatternType, ResourceName,Operation,PermissionType,Host\n"
            + "User:test1,TOPIC,LITERAL,*,READ,ALLOW,*\n"
            + "User:test3,GROUP,PREFIXED,groupNew,DESCRIBE,DENY,localhost"
    ).block();

    Collection<AclBinding> createdBindings = (Collection<AclBinding>) createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(1)
        .contains(newBindingToBeAdded);

    Collection<AclBinding> deletedBindings = (Collection<AclBinding>) deletedCaptor.getValue();
    assertThat(deletedBindings)
        .hasSize(1)
        .contains(existingBinding2);
  }

}