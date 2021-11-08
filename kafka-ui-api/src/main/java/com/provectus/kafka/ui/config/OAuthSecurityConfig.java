package com.provectus.kafka.ui.config;

import com.provectus.kafka.ui.util.EmptyRedirectStrategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.util.ClassUtils;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.enabled", havingValue = "true")
public class OAuthSecurityConfig {

  public static final String REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME =
      "org.springframework.security.oauth2.client.registration."
          + "ReactiveClientRegistrationRepository";

  private static final boolean IS_OAUTH2_PRESENT = ClassUtils.isPresent(
      REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME,
      OAuthSecurityConfig.class.getClassLoader()
  );

  private static final String[] AUTH_WHITELIST = {
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

  private final ApplicationContext context;
  private final Boolean cognitoEnabled;
  private final String clientId;
  private final String logoutUrl;

  public OAuthSecurityConfig(final ApplicationContext applicationContext,
                             @Value("${auth.cognito.enabled}") final Boolean cognitoEnabled,
                             @Value("${spring.security.oauth2.client.registration.cognito.client-id:}")
                             final String clientId,
                             @Value("${auth.cognito.logoutUrl:}") final String logoutUrl) {
    this.context = applicationContext;
    this.cognitoEnabled = cognitoEnabled;
    this.clientId = clientId;
    this.logoutUrl = logoutUrl;
  }

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http, final ReactiveClientRegistrationRepository repo) {

    final ServerLogoutSuccessHandler logoutHandler = cognitoEnabled
        ? new CognitoOidcLogoutSuccessHandler(logoutUrl, clientId)
        : new OidcClientInitiatedServerLogoutSuccessHandler(repo);

    http.authorizeExchange()
        .pathMatchers(
            AUTH_WHITELIST
        ).permitAll()
        .anyExchange()
        .authenticated();

    if (IS_OAUTH2_PRESENT && OAuth2ClasspathGuard.shouldConfigure(this.context)) {
      OAuth2ClasspathGuard.configure(this.context, http);
    } else {
      final RedirectServerAuthenticationSuccessHandler handler =
          new RedirectServerAuthenticationSuccessHandler();
      handler.setRedirectStrategy(new EmptyRedirectStrategy());

      http
          .httpBasic().and()
          .formLogin()
          .loginPage("/auth")
          .authenticationSuccessHandler(handler);
    }

    http
        .logout()
        .logoutSuccessHandler(logoutHandler);

    return http.csrf().disable().build();
  }

  private static class OAuth2ClasspathGuard {
    static void configure(ApplicationContext context, ServerHttpSecurity http) {
      http
          .oauth2Login()
          .and()
          .oauth2Client()
          .and().logout();
    }

    static boolean shouldConfigure(ApplicationContext context) {
      ClassLoader loader = context.getClassLoader();
      Class<?> reactiveClientRegistrationRepositoryClass =
          ClassUtils.resolveClassName(REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME, loader);
      return context.getBeanNamesForType(reactiveClientRegistrationRepositoryClass).length == 1;
    }
  }


}

