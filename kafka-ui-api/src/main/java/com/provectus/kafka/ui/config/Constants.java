package com.provectus.kafka.ui.config;

public class Constants {

  public static final String[] AUTH_WHITELIST = {
      "/css/**",
      "/js/**",
      "/media/**",
      "/resources/**",
      "/actuator/health",
      "/actuator/info",
      "/auth",
      "/login",
      "/logout",
      "/oauth2/**"
  };

}
