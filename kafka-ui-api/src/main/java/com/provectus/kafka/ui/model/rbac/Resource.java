package com.provectus.kafka.ui.model.rbac;

import com.provectus.kafka.ui.model.rbac.permission.AclAction;
import com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import jakarta.annotation.Nullable;
import java.util.List;
import org.apache.commons.lang3.EnumUtils;

public enum Resource {

  APPLICATIONCONFIG(ApplicationConfigAction.values()),

  CLUSTERCONFIG(ClusterConfigAction.values()),

  TOPIC(TopicAction.values()),

  CONSUMER(ConsumerGroupAction.values()),

  SCHEMA(SchemaAction.values()),

  CONNECT(ConnectAction.values()),

  KSQL(KsqlAction.values()),

  ACL(AclAction.values()),

  AUDIT(AclAction.values());

  private final List<PermissibleAction> actions;

  Resource(PermissibleAction[] actions) {
    this.actions = List.of(actions);
  }

  public List<PermissibleAction> allActions() {
    return actions;
  }

  @Nullable
  public static Resource fromString(String name) {
    return EnumUtils.getEnum(Resource.class, name);
  }

  public List<PermissibleAction> parseActions(List<String> actionsToParse) {
    return actionsToParse.stream()
        .map(String::toUpperCase)
        .map(toParse -> allActions().stream()
            .filter(a -> toParse.equals(a.name().toUpperCase()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("no actions found for string '%s'".formatted(toParse)))
        )
        .toList();
  }

}
