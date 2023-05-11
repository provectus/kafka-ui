package com.provectus.kafka.ui.config.auth.condition;

import org.springframework.boot.autoconfigure.condition.AllNestedConditions;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

public class ActiveDirectoryCondition extends AllNestedConditions {

  public ActiveDirectoryCondition() {
    super(ConfigurationPhase.PARSE_CONFIGURATION);
  }

  @ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
  public static class OnAuthType {

  }

  @ConditionalOnProperty(value = "${oauth2.ldap.activeDirectory}:false", havingValue = "true", matchIfMissing = false)
  public static class OnActiveDirectory {

  }
}
