package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ConnectorAction implements PermissibleAction {

  VIEW,
  CONFIG_VIEW,
  CREATE,
  DELETE,
  EDIT,
  RESTART,

  TASKS_VIEW,
  TASKS_ALTER

  ;

  @Nullable
  public static ConnectorAction fromString(String name) {
    return EnumUtils.getEnum(ConnectorAction.class, name);
  }
  
}
