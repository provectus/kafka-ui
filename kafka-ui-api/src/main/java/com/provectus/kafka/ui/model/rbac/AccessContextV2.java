package com.provectus.kafka.ui.model.rbac;

import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.AuditAction;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import jakarta.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import lombok.Value;
import org.springframework.util.Assert;

@Value
public class AccessContextV2 {

  public record ResourceAccess(@Nullable String name, ResourceV2 type, List<PermissibleAction> actions) {
  }

  String cluster;
  List<ResourceAccess> accesses;
  String operationName;
  Object operationParams;

  public static AccessContextBuilder builder() {
    return new AccessContextBuilder();
  }

  public static final class AccessContextBuilder {

    private String cluster;
    private String operationName;
    private Object operationParams;
    private List<ResourceAccess> accesses = new ArrayList<>();

    private AccessContextBuilder() {
    }

    public AccessContextBuilder applicationConfigActions(ApplicationConfigAction... actions) {
      accesses.add(new ResourceAccess(null, ResourceV2.APPLICATIONCONFIG, List.of(actions)));
      return this;
    }

    public AccessContextBuilder cluster(String cluster) {
      this.cluster = cluster;
      return this;
    }

    public AccessContextBuilder clusterConfigActions(ClusterConfigAction... actions) {
      accesses.add(new ResourceAccess(null, ResourceV2.CLUSTERCONFIG, List.of(actions)));
      return this;
    }

    public AccessContextBuilder topicActions(String topic, TopicAction... actions) {
      accesses.add(new ResourceAccess(topic, ResourceV2.APPLICATIONCONFIG, List.of(actions)));
      return this;
    }

    public AccessContextBuilder consumerGroupActions(String consumerGroup, ConsumerGroupAction actions) {
      accesses.add(new ResourceAccess(consumerGroup, ResourceV2.CONSUMER, List.of(actions)));
      return this;
    }

    public AccessContextBuilder connectActions(String connect, ConnectAction... actions) {
      accesses.add(new ResourceAccess(connect, ResourceV2.CONSUMER, List.of(actions)));
      return this;
    }

    public AccessContextBuilder schemaActions(String schema, SchemaAction... actions) {
      accesses.add(new ResourceAccess(schema, ResourceV2.SCHEMA, List.of(actions)));
      return this;
    }

    public AccessContextBuilder ksqlActions(KsqlAction... actions) {
      accesses.add(new ResourceAccess(null, ResourceV2.KSQL, List.of(actions)));
      return this;
    }

    public AccessContextBuilder aclActions(AclAction... actions) {
      accesses.add(new ResourceAccess(null, ResourceV2.ACL, List.of(actions)));
      return this;
    }

    public AccessContextBuilder auditActions(AuditAction... actions) {
      Assert.isTrue(actions.length > 0, "actions not present");
      accesses.add(new ResourceAccess(null, ResourceV2.AUDIT, List.of(actions)));
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

    public AccessContextV2 build() {
      return new AccessContextV2(cluster, accesses, operationName, operationParams);
    }
  }
}
