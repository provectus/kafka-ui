package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ClusterConfigAction implements PermissibleAction {

  VIEW,
  EDIT

  ;

  @Nullable
  public static ClusterConfigAction fromString(String name) {
    return EnumUtils.getEnum(ClusterConfigAction.class, name);
  }

}
