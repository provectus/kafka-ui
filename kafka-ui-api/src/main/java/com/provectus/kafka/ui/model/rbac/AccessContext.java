package com.provectus.kafka.ui.model.rbac;

import com.google.common.base.Preconditions;
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
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Value;
import org.springframework.security.access.AccessDeniedException;

@Value
public class AccessContext {

  public interface ResourceAccess {
    // will be used for audit, should be serializable via json object mapper
    @Nullable
    Object resourceId();

    Resource resourceType();

    Collection<PermissibleAction> requestedActions();

    boolean isAccessible(List<Permission> userPermissions);
  }

  record SingleResourceAccess(@Nullable String name,
                              Resource resourceType,
                              Collection<PermissibleAction> requestedActions) implements ResourceAccess {

    SingleResourceAccess(Resource type, List<PermissibleAction> requestedActions) {
      this(null, type, requestedActions);
    }

    @Override
    public Object resourceId() {
      return name;
    }

    @Override
    public boolean isAccessible(List<Permission> userPermissions) throws AccessDeniedException {
      var allowedActions = userPermissions.stream()
          .filter(permission -> permission.getResource() == resourceType)
          .filter(permission -> {
            if (name == null && permission.getCompiledValuePattern() == null) {
              return true;
            }
            Preconditions.checkState(permission.getCompiledValuePattern() != null && name != null);
            return permission.getCompiledValuePattern().matcher(name).matches();
          })
          .flatMap(p -> p.getParsedActions().stream())
          .collect(Collectors.toSet());

      return allowedActions.containsAll(requestedActions);
    }
  }

  String cluster;
  List<ResourceAccess> accesses;
  String operationName;
  Object operationParams;

  public static AccessContextBuilder builder() {
    return new AccessContextBuilder();
  }

  public boolean isAccessible(List<Permission> allUserPermissions) {
    return getAccesses().stream()
        .allMatch(resourceAccess -> resourceAccess.isAccessible(allUserPermissions));
  }

  public static final class AccessContextBuilder {

    private String cluster;
    private String operationName;
    private Object operationParams;
    private final List<ResourceAccess> accesses = new ArrayList<>();

    private AccessContextBuilder() {
    }

    public AccessContextBuilder cluster(String cluster) {
      this.cluster = cluster;
      return this;
    }

    public AccessContextBuilder applicationConfigActions(ApplicationConfigAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(Resource.APPLICATIONCONFIG, List.of(actions)));
      return this;
    }

    public AccessContextBuilder clusterConfigActions(ClusterConfigAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(Resource.CLUSTERCONFIG, List.of(actions)));
      return this;
    }

    public AccessContextBuilder topicActions(String topic, TopicAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(topic, Resource.TOPIC, List.of(actions)));
      return this;
    }

    public AccessContextBuilder consumerGroupActions(String consumerGroup, ConsumerGroupAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(consumerGroup, Resource.CONSUMER, List.of(actions)));
      return this;
    }

    public AccessContextBuilder connectActions(String connect, ConnectAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(connect, Resource.CONNECT, List.of(actions)));
      return this;
    }

    public AccessContextBuilder schemaActions(String schema, SchemaAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(schema, Resource.SCHEMA, List.of(actions)));
      return this;
    }

    public AccessContextBuilder schemaGlobalCompatChange() {
      accesses.add(new SingleResourceAccess(Resource.SCHEMA, List.of(SchemaAction.MODIFY_GLOBAL_COMPATIBILITY)));
      return this;
    }

    public AccessContextBuilder ksqlActions(KsqlAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(Resource.KSQL, List.of(actions)));
      return this;
    }

    public AccessContextBuilder aclActions(AclAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(Resource.ACL, List.of(actions)));
      return this;
    }

    public AccessContextBuilder auditActions(AuditAction... actions) {
      Preconditions.checkArgument(actions.length > 0, "actions not present");
      accesses.add(new SingleResourceAccess(Resource.AUDIT, List.of(actions)));
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

    public AccessContext build() {
      return new AccessContext(cluster, accesses, operationName, operationParams);
    }
  }
}
