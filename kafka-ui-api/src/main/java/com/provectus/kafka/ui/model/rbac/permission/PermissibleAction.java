package com.provectus.kafka.ui.model.rbac.permission;

public sealed interface PermissibleAction permits
    AclAction, ApplicationConfigAction,
    ConsumerGroupAction, SchemaAction,
    ConnectAction, ClusterConfigAction,
    KsqlAction, TopicAction, AuditAction {

  String name();

  boolean isAlter();

}
