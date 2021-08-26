package com.provectus.kafka.ui.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.enabled", havingValue = "true")
public class OAuthSecurityConfig {

  private static final String[] AUTH_WHITELIST = {
      "/css/**",
      "/js/**",
      "/media/**",
      "/resources/**",
      "/actuator/health",
      "/actuator/info",
      "/login",
      "/logout",
      "/oauth2/**"
  };

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    return http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST).permitAll()
        .anyExchange().authenticated()
        .and()
        .oauth2Login()
        .and()
        .csrf().disable()
        .build();
  }

}

