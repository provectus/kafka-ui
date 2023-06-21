package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum AuditAction implements PermissibleAction {

  VIEW;

  @Nullable
  public static AuditAction fromString(String name) {
    return EnumUtils.getEnum(AuditAction.class, name);
  }
}
