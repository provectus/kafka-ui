package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum UsersAction implements PermissibleAction {

  VIEW,
  EDIT

  ;

  private static final Set<UsersAction> ALTER_ACTIONS = Set.of(EDIT);

  @Nullable
  public static UsersAction fromString(String name) {
    return EnumUtils.getEnum(UsersAction.class, name);
  }

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }
}
