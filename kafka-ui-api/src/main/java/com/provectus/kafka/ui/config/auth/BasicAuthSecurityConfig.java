package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.util.EmptyRedirectStrategy;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "LOGIN_FORM")
@Log4j2
public class BasicAuthSecurityConfig extends AbstractAuthSecurityConfig {

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    log.info("Configuring LOGIN_FORM authentication.");
    http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated();

    final RedirectServerAuthenticationSuccessHandler handler = new RedirectServerAuthenticationSuccessHandler();
    handler.setRedirectStrategy(new EmptyRedirectStrategy());

    http
        .httpBasic().and()
        .formLogin()
        .loginPage("/auth")
        .authenticationSuccessHandler(handler);

    return http.csrf().disable().build();
  }

}
