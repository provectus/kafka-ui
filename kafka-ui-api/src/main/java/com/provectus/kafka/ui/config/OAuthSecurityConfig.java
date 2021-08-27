package com.provectus.kafka.ui.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.util.ClassUtils;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.enabled", havingValue = "true")
public class OAuthSecurityConfig {

  public static final String REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME =
      "org.springframework.security.oauth2.client.registration."
          + "ReactiveClientRegistrationRepository";

  private static final boolean isOAuth2Present = ClassUtils.isPresent(
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
      "/login",
      "/logout",
      "/oauth2/**"
  };

  @Autowired
  ApplicationContext context;

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST).permitAll()
        .anyExchange()
        .authenticated();

    if (isOAuth2Present && OAuth2ClasspathGuard.shouldConfigure(this.context)) {
      OAuth2ClasspathGuard.configure(this.context, http);
    } else {
      http
          .httpBasic().and()
          .formLogin();
    }

    SecurityWebFilterChain result = http.csrf().disable().build();
    return result;
  }

  private static class OAuth2ClasspathGuard {
    static void configure(ApplicationContext context, ServerHttpSecurity http) {
      http
          .oauth2Login().and()
          .oauth2Client();
    }

    static boolean shouldConfigure(ApplicationContext context) {
      ClassLoader loader = context.getClassLoader();
      Class<?> reactiveClientRegistrationRepositoryClass =
          ClassUtils.resolveClassName(REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME, loader);
      return context.getBeanNamesForType(reactiveClientRegistrationRepositoryClass).length == 1;
    }
  }


}

