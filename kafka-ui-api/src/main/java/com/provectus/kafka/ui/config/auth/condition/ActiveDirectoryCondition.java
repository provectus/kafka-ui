package com.provectus.kafka.ui.config.auth.condition;

import org.springframework.boot.autoconfigure.condition.AllNestedConditions;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

public class ActiveDirectoryCondition extends AllNestedConditions {

  public ActiveDirectoryCondition(ConfigurationPhase configurationPhase) {
    super(configurationPhase);
  }

  @ConditionalOnProperty(value = "auth.type", havingValue = "LDAP")
  static class onAuthType {

  }

  @ConditionalOnProperty(value = "oauth2.ldap.activeDirectory", havingValue = "true")
  static class onActiveDirectory {

  }
}
