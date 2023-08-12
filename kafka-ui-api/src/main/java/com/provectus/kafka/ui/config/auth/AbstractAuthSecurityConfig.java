package com.provectus.kafka.ui.config.auth;

abstract class AbstractAuthSecurityConfig {

  protected AbstractAuthSecurityConfig() {

  }

  protected static final String[] AUTH_WHITELIST = {
      "/css/**",
      "/js/**",
      "/media/**",
      "/resources/**",
      "/actuator/health/**",
      "/actuator/info",
      "/actuator/prometheus",
      "/auth",
      "/login",
      "/logout",
      "/oauth2/**",
      "/static/**"
  };

}
