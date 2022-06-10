package com.provectus.kafka.ui.config.auth;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.util.ClassUtils;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
@AllArgsConstructor
@Log4j2
public class OAuthSecurityConfig extends AbstractAuthSecurityConfig {

  public static final String REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME =
      "org.springframework.security.oauth2.client.registration."
          + "ReactiveClientRegistrationRepository";

  private static final boolean IS_OAUTH2_PRESENT = ClassUtils.isPresent(
      REACTIVE_CLIENT_REGISTRATION_REPOSITORY_CLASSNAME,
      OAuthSecurityConfig.class.getClassLoader()
  );

  private static final String GOOGLE_DOMAIN_ATTRIBUTE_NAME = "hd";

  private final ApplicationContext context;

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    log.info("Configuring OAUTH2 authentication.");
    http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated();

    if (IS_OAUTH2_PRESENT && OAuth2ClasspathGuard.shouldConfigure(this.context)) {
      OAuth2ClasspathGuard.configure(http);
    }

    return http.csrf().disable().build();
  }

  @Bean
  public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> oauth2UserService(Environment env) {
    final var oauthUserService = new OidcReactiveOAuth2UserService();

    return request -> {
      var user = oauthUserService.loadUser(request);

      return user.flatMap((u) -> {
        final String domainAttribute = u.getAttribute(GOOGLE_DOMAIN_ATTRIBUTE_NAME);
        final String allowedDomain = env.getProperty("oauth2.google.allowedDomain");

        if (domainAttribute == null) {
          log.trace("Google domain attribute is not present, skipping domain validation");
          return user;
        }

        if (allowedDomain == null) {
          log.trace("Google allowed domain has not been set, skipping domain validation");
          return user;
        }

        if (!allowedDomain.equalsIgnoreCase(domainAttribute)) {
          log.trace("Google allowed domain doesn't match the domain attribute value, rejecting authentication");
          return Mono.error(new BadCredentialsException("Authentication within this domain is prohibited"));
        }

        return user;
      });
    };
  }

  private static class OAuth2ClasspathGuard {
    static void configure(ServerHttpSecurity http) {
      http
          .oauth2Login()
          .and()
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

