package com.provectus.kafka.ui.model.rbac;

import com.provectus.kafka.ui.model.rbac.permission.ClusterAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectorAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import lombok.Value;
import org.springframework.util.Assert;

@Value
public class AccessContext {

  String cluster;
  Collection<ClusterAction> clusterActions;

  String topic;
  Collection<TopicAction> topicActions;

  String consumerGroup;
  Collection<ConsumerGroupAction> consumerGroupActions;

  String connect;
  Collection<ConnectAction> connectActions;

  String connector;
  Collection<ConnectorAction> connectorActions;

  String schema;
  Collection<SchemaAction> schemaActions;

  Collection<KsqlAction> ksqlActions;

  public static AccessContextBuilder builder() {
    return new AccessContextBuilder();
  }


  public static final class AccessContextBuilder {
    private String cluster;
    private Collection<ClusterAction> clusterActions = Collections.emptySet();
    private String topic;
    private Collection<TopicAction> topicActions = Collections.emptySet();
    private String consumerGroup;
    private Collection<ConsumerGroupAction> consumerGroupActions = Collections.emptySet();
    private String connect;
    private Collection<ConnectAction> connectActions = Collections.emptySet();
    private String connector;
    private Collection<ConnectorAction> connectorActions = Collections.emptySet();
    private String schema;
    private Collection<SchemaAction> schemaActions = Collections.emptySet();
    private Collection<KsqlAction> ksqlActions = Collections.emptySet();

    private AccessContextBuilder() {
    }

    public AccessContextBuilder cluster(String cluster) {
      this.cluster = cluster;
      return this;
    }

    public AccessContextBuilder clusterActions(ClusterAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.clusterActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder topic(String topic) {
      this.topic = topic;
      return this;
    }

    public AccessContextBuilder topicActions(TopicAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.topicActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder consumerGroup(String consumerGroup) {
      this.consumerGroup = consumerGroup;
      return this;
    }

    public AccessContextBuilder consumerGroupActions(ConsumerGroupAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.consumerGroupActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder connect(String connect) {
      this.connect = connect;
      return this;
    }

    public AccessContextBuilder connectActions(ConnectAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.connectActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder connector(String connector) {
      this.connector = connector;
      return this;
    }

    public AccessContextBuilder connectorActions(ConnectorAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.connectorActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder schema(String schema) {
      this.schema = schema;
      return this;
    }

    public AccessContextBuilder schemaActions(SchemaAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.schemaActions = List.of(actions);
      return this;
    }

    public AccessContextBuilder ksqlActions(KsqlAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      this.ksqlActions = List.of(actions);
      return this;
    }

    public AccessContext build() {
      return new AccessContext(cluster, clusterActions,
          topic, topicActions,
          consumerGroup, consumerGroupActions,
          connect, connectActions,
          connector, connectorActions,
          schema, schemaActions,
          ksqlActions);
    }
  }
}
