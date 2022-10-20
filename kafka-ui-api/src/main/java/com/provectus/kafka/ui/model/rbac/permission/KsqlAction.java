package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum KsqlAction implements PermissibleAction {

//  EXECUTE_READ,
//  EXECUTE_WRITE
  EXECUTE

  ;

  @Nullable
  public static KsqlAction fromString(String name) {
    return EnumUtils.getEnum(KsqlAction.class, name);
  }

}
