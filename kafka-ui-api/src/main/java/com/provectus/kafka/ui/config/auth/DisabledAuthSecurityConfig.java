package com.provectus.kafka.ui.config.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "DISABLED")
@Slf4j
public class DisabledAuthSecurityConfig extends AbstractAuthSecurityConfig {

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http, Environment env, ApplicationContext context) {
    if (env.getProperty("auth.enabled") != null) {
      log.error("A deprecated property (auth.enabled) is present. "
          + "Please replace it with 'auth.type' (possible values are: 'LOGIN_FORM', 'DISABLED', 'OAUTH2', 'LDAP') "
          + "and restart the application.");
      SpringApplication.exit(context, () -> 1);
      System.exit(1);
    }
    log.warn("Authentication is disabled. Access will be unrestricted.");

    return http.authorizeExchange(spec -> spec
            .anyExchange()
            .permitAll()
        )
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .build();
  }

}
