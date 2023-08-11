package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum AuditAction implements PermissibleAction {

  VIEW

  ;

  private static final Set<AuditAction> ALTER_ACTIONS = Set.of();

  @Nullable
  public static AuditAction fromString(String name) {
    return EnumUtils.getEnum(AuditAction.class, name);
  }

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }
}
