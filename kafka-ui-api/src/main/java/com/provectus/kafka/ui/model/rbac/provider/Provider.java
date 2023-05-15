package com.provectus.kafka.ui.model.rbac.provider;

import org.apache.commons.lang3.EnumUtils;
import org.jetbrains.annotations.Nullable;

public enum Provider {

  OAUTH_GOOGLE,
  OAUTH_GITHUB,

  OAUTH_COGNITO,

  OAUTH,

  LDAP,
  LDAP_AD;

  @Nullable
  public static Provider fromString(String name) {
    return EnumUtils.getEnum(Provider.class, name);
  }

  public static class Name {
    public static String GOOGLE = "google";
    public static String GITHUB = "github";
    public static String COGNITO = "cognito";

    public static String OAUTH = "oauth";
  }

}
