package com.provectus.kafka.ui.config.auth;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "DISABLED")
@Log4j2
public class DisabledAuthSecurityConfig {

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    log.warn("Authentication is disabled. Access will be unrestricted.");
    return http.authorizeExchange()
        .anyExchange().permitAll()
        .and()
        .csrf().disable()
        .build();
  }

}
