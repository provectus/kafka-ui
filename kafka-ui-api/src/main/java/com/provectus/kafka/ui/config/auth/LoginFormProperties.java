package com.provectus.kafka.ui.config.auth;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@ConfigurationProperties("auth.login-form")
@Data
public class LoginFormProperties {

  @NestedConfigurationProperty
  private UserManagement userManagement = new UserManagement();

  @Data
  public static class UserManagement {
    private boolean enabled = false;
    private String initialAdminPassword;
  }

}
