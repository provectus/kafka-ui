package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum SchemaAction implements PermissibleAction {

  VIEW,
  CREATE,
  DELETE,
  EDIT,
  MODIFY_GLOBAL_COMPATIBILITY

  ;

  @Nullable
  public static SchemaAction fromString(String name) {
    return EnumUtils.getEnum(SchemaAction.class, name);
  }

}
