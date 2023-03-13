package com.provectus.kafka.ui.model.rbac.permission;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum ApplicationConfigAction implements PermissibleAction {

  VIEW,
  EDIT

  ;

  @Nullable
  public static ApplicationConfigAction fromString(String name) {
    return EnumUtils.getEnum(ApplicationConfigAction.class, name);
  }

}
