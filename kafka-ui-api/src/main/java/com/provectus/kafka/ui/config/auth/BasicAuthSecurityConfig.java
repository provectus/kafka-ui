package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.service.account.UserRepository;
import com.provectus.kafka.ui.service.account.UserRoleRepository;
import com.provectus.kafka.ui.util.EmptyRedirectStrategy;
import java.net.URI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
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
  @ConditionalOnProperty(value = "auth.login-form.user-management.enabled", havingValue = "true")
  public ReactiveUserDetailsService reactiveUserDetailsService(UserRepository userRepository,
                                                                UserRoleRepository userRoleRepository) {
    return new R2dbcReactiveUserDetailsService(userRepository, userRoleRepository);
  }

  @Bean
  @ConditionalOnProperty(value = "auth.login-form.user-management.enabled", havingValue = "true")
  public ReactiveAuthenticationManager reactiveAuthenticationManager(ReactiveUserDetailsService userDetailsService,
                                                                      PasswordEncoder passwordEncoder,
                                                                      Environment env) {
    if (env.getProperty("spring.security.user.name") != null) {
      log.warn("Both 'auth.login-form.user-management.enabled' and 'spring.security.user.name' are set. "
          + "The single-user 'spring.security.user.*' credentials will be ignored in favor of "
          + "the DB-backed multi-user accounts.");
    }
    var manager = new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
    manager.setPasswordEncoder(passwordEncoder);
    return manager;
  }

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
