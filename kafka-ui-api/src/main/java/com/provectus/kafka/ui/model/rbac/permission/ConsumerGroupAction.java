package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ConsumerGroupAction implements PermissibleAction {

  VIEW,
  DELETE,

  RESET_OFFSETS

  ;

  @Nullable
  public static ConsumerGroupAction fromString(String name) {
    return EnumUtils.getEnum(ConsumerGroupAction.class, name);
  }

}
