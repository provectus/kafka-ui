package com.provectus.kafka.ui.model.rbac;

import static com.provectus.kafka.ui.model.rbac.Resource.ACL;
import static com.provectus.kafka.ui.model.rbac.Resource.APPLICATIONCONFIG;
import static com.provectus.kafka.ui.model.rbac.Resource.AUDIT;
import static com.provectus.kafka.ui.model.rbac.Resource.CLUSTERCONFIG;
import static com.provectus.kafka.ui.model.rbac.Resource.KSQL;

import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.AuditAction;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.util.Assert;

@Getter
@ToString
@EqualsAndHashCode
public class Permission {

  private static final List<Resource> RBAC_ACTION_EXEMPT_LIST =
      List.of(KSQL, CLUSTERCONFIG, APPLICATIONCONFIG, ACL, AUDIT);

  Resource resource;
  List<String> actions;

  @Nullable
  String value;
  @Nullable
  transient Pattern compiledValuePattern;

  @SuppressWarnings("unused")
  public void setResource(String resource) {
    this.resource = Resource.fromString(resource.toUpperCase());
  }

  @SuppressWarnings("unused")
  public void setValue(@Nullable String value) {
    this.value = value;
  }

  @SuppressWarnings("unused")
  public void setActions(List<String> actions) {
    this.actions = actions;
  }

  public void validate() {
    Assert.notNull(resource, "resource cannot be null");
    if (!RBAC_ACTION_EXEMPT_LIST.contains(this.resource)) {
      Assert.notNull(value, "permission value can't be empty for resource " + resource);
    }
  }

  public void transform() {
    if (value != null) {
      this.compiledValuePattern = Pattern.compile(value);
    }
    if (CollectionUtils.isNotEmpty(actions) && actions.stream().anyMatch("ALL"::equalsIgnoreCase)) {
      this.actions = getAllActionValues();
    }
  }

  private List<String> getAllActionValues() {
    if (resource == null) {
      return Collections.emptyList();
    }

    return switch (this.resource) {
      case APPLICATIONCONFIG -> Arrays.stream(ApplicationConfigAction.values()).map(Enum::toString).toList();
      case CLUSTERCONFIG -> Arrays.stream(ClusterConfigAction.values()).map(Enum::toString).toList();
      case TOPIC -> Arrays.stream(TopicAction.values()).map(Enum::toString).toList();
      case CONSUMER -> Arrays.stream(ConsumerGroupAction.values()).map(Enum::toString).toList();
      case SCHEMA -> Arrays.stream(SchemaAction.values()).map(Enum::toString).toList();
      case CONNECT -> Arrays.stream(ConnectAction.values()).map(Enum::toString).toList();
      case KSQL -> Arrays.stream(KsqlAction.values()).map(Enum::toString).toList();
      case ACL -> Arrays.stream(AclAction.values()).map(Enum::toString).toList();
      case AUDIT -> Arrays.stream(AuditAction.values()).map(Enum::toString).toList();
    };
  }

}
