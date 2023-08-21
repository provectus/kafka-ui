package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ConsumerGroupAction implements PermissibleAction {

  VIEW,
  DELETE,
  RESET_OFFSETS

  ;

  public static final Set<ConsumerGroupAction> ALTER_ACTIONS = Set.of(DELETE, RESET_OFFSETS);

  @Nullable
  public static ConsumerGroupAction fromString(String name) {
    return EnumUtils.getEnum(ConsumerGroupAction.class, name);
  }

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }
}
