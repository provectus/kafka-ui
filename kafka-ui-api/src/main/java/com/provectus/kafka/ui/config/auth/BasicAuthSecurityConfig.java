package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.util.EmptyRedirectStrategy;
import java.net.URI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.RedirectServerLogoutSuccessHandler;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "LOGIN_FORM")
@Slf4j
public class BasicAuthSecurityConfig extends AbstractAuthSecurityConfig {

  public static final String LOGIN_URL = "/auth";
  public static final String LOGOUT_URL = "/auth?logout";

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    log.info("Configuring LOGIN_FORM authentication.");

    final var authHandler = new RedirectServerAuthenticationSuccessHandler();
    authHandler.setRedirectStrategy(new EmptyRedirectStrategy());

    final var logoutSuccessHandler = new RedirectServerLogoutSuccessHandler();
    logoutSuccessHandler.setLogoutSuccessUrl(URI.create(LOGOUT_URL));


    return http.authorizeExchange(spec -> spec
            .pathMatchers(AUTH_WHITELIST)
            .permitAll()
            .anyExchange()
            .authenticated()
        )
        .formLogin(spec -> spec.loginPage(LOGIN_URL).authenticationSuccessHandler(authHandler))
        .logout(spec -> spec
            .logoutSuccessHandler(logoutSuccessHandler)
            .requiresLogout(ServerWebExchangeMatchers.pathMatchers(HttpMethod.GET, "/logout")))
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .build();
  }

}
