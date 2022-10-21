package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ClusterAction implements PermissibleAction {

  VIEW,
  EDIT

  ;

  @Nullable
  public static ClusterAction fromString(String name) {
    return EnumUtils.getEnum(ClusterAction.class, name);
  }

}
