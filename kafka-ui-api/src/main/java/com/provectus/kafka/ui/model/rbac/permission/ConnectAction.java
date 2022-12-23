package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ConnectAction implements PermissibleAction {

  VIEW,
  EDIT,
  CREATE

  ;

  @Nullable
  public static ConnectAction fromString(String name) {
    return EnumUtils.getEnum(ConnectAction.class, name);
  }

}
