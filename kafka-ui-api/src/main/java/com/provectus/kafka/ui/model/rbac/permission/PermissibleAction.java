package com.provectus.kafka.ui.model.rbac.permission;

import java.util.stream.Stream;

public sealed interface PermissibleAction permits
    AclAction, ApplicationConfigAction,
    ConsumerGroupAction, SchemaAction,
    ConnectAction, ClusterConfigAction,
    KsqlAction, TopicAction, AuditAction {

  String name();

  boolean isAlter();

  /**
   * Actions that are direct parts (childs) of this action. If current action is allowed for user, then
   * all dependant actions supposed to be allowed. Dependants can also have their dependants, that can be recursively
   * unnested with `unnestAllDependants` method.
   */
  PermissibleAction[] dependantActions();

  // recursively unnest all action's dependants
  default Stream<PermissibleAction> unnestAllDependants() {
    return Stream.of(dependantActions()).flatMap(dep -> Stream.concat(Stream.of(dep), dep.unnestAllDependants()));
  }

}
