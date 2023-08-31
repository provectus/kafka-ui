package com.provectus.kafka.ui.model.rbac;

import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.AuditAction;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.Value;
import org.springframework.util.Assert;

@Value
public class AccessContext {

  Collection<ApplicationConfigAction> applicationConfigActions;

  String cluster;
  Collection<ClusterConfigAction> clusterConfigActions;

  String topic;
  Collection<TopicAction> topicActions;

  String consumerGroup;
  Collection<ConsumerGroupAction> consumerGroupActions;

  String connect;
  Collection<ConnectAction> connectActions;

  String connector;

  String schema;
  Collection<SchemaAction> schemaActions;

  Collection<KsqlAction> ksqlActions;

  Collection<AclAction> aclActions;

  Collection<AuditAction> auditAction;

  String operationName;
  Object operationParams;

  public static AccessContextBuilder builder() {
    return new AccessContextBuilder();
  }

  public static final class AccessContextBuilder {
    private static final String ACTIONS_NOT_PRESENT = "actions not present";

    private Collection<ApplicationConfigAction> applicationConfigActions = Collections.emptySet();
    private String cluster;
    private Collection<ClusterConfigAction> clusterConfigActions = Collections.emptySet();
    private String topic;
    private Collection<TopicAction> topicActions = Collections.emptySet();
    private String consumerGroup;
    private Collection<ConsumerGroupAction> consumerGroupActions = Collections.emptySet();
    private String connect;
    private Collection<ConnectAction> connectActions = Collections.emptySet();
    private String connector;
    private String schema;
    private Collection<SchemaAction> schemaActions = Collections.emptySet();
    private Collection<KsqlAction> ksqlActions = Collections.emptySet();
    private Collection<AclAction> aclActions = Collections.emptySet();
    private Collection<AuditAction> auditActions = Collections.emptySet();

    private String operationName;
    private Object operationParams;

    private AccessContextBuilder() {
    }

    public AccessContextBuilder applicationConfigActions(ApplicationConfigAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.applicationConfigActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder cluster(String cluster) {
      this.cluster = cluster;
      return this;
    }

    public AccessContextBuilder clusterConfigActions(ClusterConfigAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.clusterConfigActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder topic(String topic) {
      this.topic = topic;
      return this;
    }

    public AccessContextBuilder topicActions(TopicAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.topicActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder consumerGroup(String consumerGroup) {
      this.consumerGroup = consumerGroup;
      return this;
    }

    public AccessContextBuilder consumerGroupActions(ConsumerGroupAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.consumerGroupActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder connect(String connect) {
      this.connect = connect;
      return this;
    }

    public AccessContextBuilder connectActions(ConnectAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.connectActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder connector(String connector) {
      this.connector = connector;
      return this;
    }

    public AccessContextBuilder schema(String schema) {
      this.schema = schema;
      return this;
    }

    public AccessContextBuilder schemaActions(SchemaAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.schemaActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder ksqlActions(KsqlAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.ksqlActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder aclActions(AclAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.aclActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder auditActions(AuditAction... actions) {
      Assert.isTrue(actions.length > 0, ACTIONS_NOT_PRESENT);
      this.auditActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder operationName(String operationName) {
      this.operationName = operationName;
      return this;
    }

    public AccessContextBuilder operationParams(Object operationParams) {
      this.operationParams = operationParams;
      return this;
    }

    public AccessContextBuilder operationParams(Map<String, Object> paramsMap) {
      this.operationParams = paramsMap;
      return this;
    }

    public AccessContext build() {
      return new AccessContext(
          applicationConfigActions,
          cluster, clusterConfigActions,
          topic, topicActions,
          consumerGroup, consumerGroupActions,
          connect, connectActions,
          connector,
          schema, schemaActions,
          ksqlActions, aclActions, auditActions,
          operationName, operationParams);
    }
  }
}
