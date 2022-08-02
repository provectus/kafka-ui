package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.config.CognitoOidcLogoutSuccessHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.cognito.enabled", havingValue = "true")
@Slf4j
public class CognitoOAuthSecurityConfig extends AbstractAuthSecurityConfig {

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http, Environment env) {
    log.info("Configuring Cognito OAUTH2 authentication.");

    String clientId = env.getRequiredProperty("auth.cognito.client-id");
    String logoutUrl = env.getRequiredProperty("auth.cognito.logout-url");

    final ServerLogoutSuccessHandler logoutHandler = new CognitoOidcLogoutSuccessHandler(logoutUrl, clientId);

    return http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated()
        .and()
        .oauth2Login()
        .and()
        .oauth2Client()
        .and().logout()
        .and()
        .logout()
        .logoutSuccessHandler(logoutHandler)
        .and()
        .csrf().disable().build();
  }

}

