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
import java.util.List;

public enum ResourceV2 {

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

  ResourceV2(PermissibleAction[] actions) {
    this.actions = List.of(actions);
  }

  public List<PermissibleAction> allActions() {
    return actions;
  }

  public List<PermissibleAction> parseActions(List<String> actions) {
    return actions.stream()
        .map(String::toUpperCase)
        .map(toParse -> allActions().stream()
            .filter(a -> toParse.equals(a.name().toUpperCase()))
            .findFirst().
            orElseThrow() //TODO err msg
        )
        .toList();
  }

}
