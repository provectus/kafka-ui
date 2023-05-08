package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum AclAction implements PermissibleAction {

  VIEW,
  EDIT;

  @Nullable
  public static AclAction fromString(String name) {
    return EnumUtils.getEnum(AclAction.class, name);
  }
}
