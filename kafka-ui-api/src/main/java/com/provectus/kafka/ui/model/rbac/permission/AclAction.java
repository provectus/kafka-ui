package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum AclAction implements PermissibleAction {

  VIEW,
  EDIT(VIEW)

  ;

  public static final Set<AclAction> ALTER_ACTIONS = Set.of(EDIT);

  private final PermissibleAction[] dependantActions;

  AclAction(AclAction... dependantActions) {
    this.dependantActions = dependantActions;
  }

  @Nullable
  public static AclAction fromString(String name) {
    return EnumUtils.getEnum(AclAction.class, name);
  }

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }

  @Override
  public PermissibleAction[] dependantActions() {
    return dependantActions;
  }
}
