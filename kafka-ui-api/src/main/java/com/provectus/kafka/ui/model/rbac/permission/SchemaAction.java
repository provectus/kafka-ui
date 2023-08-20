package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum SchemaAction implements PermissibleAction {

  VIEW,
  CREATE,
  DELETE,
  EDIT,
  MODIFY_GLOBAL_COMPATIBILITY

  ;

  public static final Set<SchemaAction> ALTER_ACTIONS = Set.of(CREATE, DELETE, EDIT, MODIFY_GLOBAL_COMPATIBILITY);

  @Nullable
  public static SchemaAction fromString(String name) {
    return EnumUtils.getEnum(SchemaAction.class, name);
  }

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }
}
