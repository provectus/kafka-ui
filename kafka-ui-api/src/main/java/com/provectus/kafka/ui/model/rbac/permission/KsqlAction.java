package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum KsqlAction implements PermissibleAction {

  EXECUTE

  ;

  public static final Set<KsqlAction> ALTER_ACTIONS = Set.of(EXECUTE);

  @Nullable
  public static KsqlAction fromString(String name) {
    return EnumUtils.getEnum(KsqlAction.class, name);
  }

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }
}
