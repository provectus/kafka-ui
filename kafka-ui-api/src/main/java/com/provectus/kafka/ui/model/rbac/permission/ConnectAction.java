package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;
import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ConnectAction implements PermissibleAction {

  VIEW,
  EDIT(VIEW),
  CREATE(VIEW),
  RESTART(VIEW)

  ;

  private final ConnectAction[] dependantActions;

  ConnectAction(ConnectAction... dependantActions) {
    this.dependantActions = dependantActions;
  }

  public static final Set<ConnectAction> ALTER_ACTIONS = Set.of(CREATE, EDIT, RESTART);

  @Nullable
  public static ConnectAction fromString(String name) {
    return EnumUtils.getEnum(ConnectAction.class, name);
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
