package com.provectus.kafka.ui.model.rbac.permission;

import java.util.Set;

public enum ClientQuotaAction implements PermissibleAction {

  VIEW,
  EDIT

  ;

  public static final Set<ClientQuotaAction> ALTER_ACTIONS = Set.of(EDIT);

  @Override
  public boolean isAlter() {
    return ALTER_ACTIONS.contains(this);
  }

}
