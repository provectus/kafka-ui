package com.provectus.kafka.ui.service.acl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.model.CreateConsumerAclDTO;
import com.provectus.kafka.ui.model.CreateProducerAclDTO;
import com.provectus.kafka.ui.model.CreateStreamAppAclDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.apache.kafka.common.acl.AccessControlEntry;
import org.apache.kafka.common.acl.AclBinding;
import org.apache.kafka.common.acl.AclOperation;
import org.apache.kafka.common.acl.AclPermissionType;
import org.apache.kafka.common.resource.PatternType;
import org.apache.kafka.common.resource.Resource;
import org.apache.kafka.common.resource.ResourcePattern;
import org.apache.kafka.common.resource.ResourcePatternFilter;
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

    when(adminClientMock.listAcls(ResourcePatternFilter.ANY))
        .thenReturn(Mono.just(List.of(existingBinding1, existingBinding2)));

    ArgumentCaptor<Collection<AclBinding>> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls(createdCaptor.capture()))
        .thenReturn(Mono.empty());

    ArgumentCaptor<Collection<AclBinding>> deletedCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.deleteAcls(deletedCaptor.capture()))
        .thenReturn(Mono.empty());

    aclsService.syncAclWithAclCsv(
        CLUSTER,
        "Principal,ResourceType, PatternType, ResourceName,Operation,PermissionType,Host\n"
            + "User:test1,TOPIC,LITERAL,*,READ,ALLOW,*\n"
            + "User:test3,GROUP,PREFIXED,groupNew,DESCRIBE,DENY,localhost"
    ).block();

    Collection<AclBinding> createdBindings = createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(1)
        .contains(newBindingToBeAdded);

    Collection<AclBinding> deletedBindings = deletedCaptor.getValue();
    assertThat(deletedBindings)
        .hasSize(1)
        .contains(existingBinding2);
  }


  @Test
  void createsConsumerDependantAcls() {
    ArgumentCaptor<Collection<AclBinding>> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls(createdCaptor.capture()))
        .thenReturn(Mono.empty());

    var principal = UUID.randomUUID().toString();
    var host = UUID.randomUUID().toString();

    aclsService.createConsumerAcl(
        CLUSTER,
        new CreateConsumerAclDTO()
            .principal(principal)
            .host(host)
            .consumerGroups(List.of("cg1", "cg2"))
            .topics(List.of("t1", "t2"))
    ).block();

    //Read, Describe on topics, Read on consumerGroups
    Collection<AclBinding> createdBindings = createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(6)
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t2", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t2", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.GROUP, "cg1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.GROUP, "cg2", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)));
  }

  @Test
  void createsConsumerDependantAclsWhenTopicsAndGroupsSpecifiedByPrefix() {
    ArgumentCaptor<Collection<AclBinding>> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls(createdCaptor.capture()))
        .thenReturn(Mono.empty());

    var principal = UUID.randomUUID().toString();
    var host = UUID.randomUUID().toString();

    aclsService.createConsumerAcl(
        CLUSTER,
        new CreateConsumerAclDTO()
            .principal(principal)
            .host(host)
            .consumerGroupsPrefix("cgPref")
            .topicsPrefix("topicPref")
    ).block();

    //Read, Describe on topics, Read on consumerGroups
    Collection<AclBinding> createdBindings = createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(3)
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "topicPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "topicPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.GROUP, "cgPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)));
  }

  @Test
  void createsProducerDependantAcls() {
    ArgumentCaptor<Collection<AclBinding>> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls(createdCaptor.capture()))
        .thenReturn(Mono.empty());

    var principal = UUID.randomUUID().toString();
    var host = UUID.randomUUID().toString();

    aclsService.createProducerAcl(
        CLUSTER,
        new CreateProducerAclDTO()
            .principal(principal)
            .host(host)
            .topics(List.of("t1"))
            .idempotent(true)
            .transactionalId("txId1")
    ).block();

    //Write, Describe, Create permission on topics, Write, Describe on transactionalIds
    //IDEMPOTENT_WRITE on cluster if idempotent is enabled (true)
    Collection<AclBinding> createdBindings = createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(6)
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.WRITE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.CREATE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TRANSACTIONAL_ID, "txId1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.WRITE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TRANSACTIONAL_ID, "txId1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.CLUSTER, Resource.CLUSTER_NAME, PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.IDEMPOTENT_WRITE, AclPermissionType.ALLOW)));
  }


  @Test
  void createsProducerDependantAclsWhenTopicsAndTxIdSpecifiedByPrefix() {
    ArgumentCaptor<Collection<AclBinding>> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls(createdCaptor.capture()))
        .thenReturn(Mono.empty());

    var principal = UUID.randomUUID().toString();
    var host = UUID.randomUUID().toString();

    aclsService.createProducerAcl(
        CLUSTER,
        new CreateProducerAclDTO()
            .principal(principal)
            .host(host)
            .topicsPrefix("topicPref")
            .transactionsIdPrefix("txIdPref")
            .idempotent(false)
    ).block();

    //Write, Describe, Create permission on topics, Write, Describe on transactionalIds
    //IDEMPOTENT_WRITE on cluster if idempotent is enabled (false)
    Collection<AclBinding> createdBindings = createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(5)
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "topicPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.WRITE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "topicPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "topicPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.CREATE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TRANSACTIONAL_ID, "txIdPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.WRITE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TRANSACTIONAL_ID, "txIdPref", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.DESCRIBE, AclPermissionType.ALLOW)));
  }


  @Test
  void createsStreamAppDependantAcls() {
    ArgumentCaptor<Collection<AclBinding>> createdCaptor = ArgumentCaptor.forClass(Collection.class);
    when(adminClientMock.createAcls(createdCaptor.capture()))
        .thenReturn(Mono.empty());

    var principal = UUID.randomUUID().toString();
    var host = UUID.randomUUID().toString();

    aclsService.createStreamAppAcl(
        CLUSTER,
        new CreateStreamAppAclDTO()
            .principal(principal)
            .host(host)
            .inputTopics(List.of("t1"))
            .outputTopics(List.of("t2", "t3"))
            .applicationId("appId1")
    ).block();

    // Read on input topics, Write on output topics
    // ALL on applicationId-prefixed Groups and Topics
    Collection<AclBinding> createdBindings = createdCaptor.getValue();
    assertThat(createdBindings)
        .hasSize(5)
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t1", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.READ, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t2", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.WRITE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "t3", PatternType.LITERAL),
            new AccessControlEntry(principal, host, AclOperation.WRITE, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.GROUP, "appId1", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.ALL, AclPermissionType.ALLOW)))
        .contains(new AclBinding(
            new ResourcePattern(ResourceType.TOPIC, "appId1", PatternType.PREFIXED),
            new AccessControlEntry(principal, host, AclOperation.ALL, AclPermissionType.ALLOW)));
  }
}
