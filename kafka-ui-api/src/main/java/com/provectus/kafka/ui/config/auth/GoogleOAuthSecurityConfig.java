package com.provectus.kafka.ui.config.auth;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@ConditionalOnProperty(value = "auth.google.enabled", havingValue = "true")
@AllArgsConstructor
@Slf4j
public class GoogleOAuthSecurityConfig extends AbstractAuthSecurityConfig {

  private static final String GOOGLE_DOMAIN_ATTRIBUTE_NAME = "hd";
  public static final String GOOGLE = "google";

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http) {
    log.info("Configuring Google OAUTH2 authentication.");
    http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated();

    return http
        .oauth2Login()
        .and()
        .oauth2Client()

        .and()
        .csrf().disable().build();
  }

  @Bean
  public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> oauth2UserService(Environment env) {
    final var oauthUserService = new OidcReactiveOAuth2UserService();

    return request -> {
      var user = oauthUserService.loadUser(request);

      return user.flatMap((u) -> {
        final String domainAttribute = u.getAttribute(GOOGLE_DOMAIN_ATTRIBUTE_NAME);
        final String allowedDomain = env.getProperty("auth.google.allowed-domain");

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

  @Bean
  public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository(Environment env) {
    String clientId = env.getRequiredProperty("auth.google.client-id");
    String clientSecret = env.getRequiredProperty("auth.google.client-secret");
    String authUrl = env.getProperty("auth.google.authorization-url");
    String allowedDomain = env.getProperty("auth.google.allowed-domain");

    if (authUrl == null) {
      authUrl = CommonOAuth2Provider.GOOGLE
          .getBuilder(GOOGLE)
          .clientId("dummy")
          .clientSecret("dummy")
          .build()
          .getProviderDetails()
          .getAuthorizationUri();
    }

    if (allowedDomain != null) {
      authUrl = authUrl + "?hd=" + allowedDomain;
    }

    return new InMemoryReactiveClientRegistrationRepository(
        CommonOAuth2Provider.GOOGLE
            .getBuilder(GOOGLE)
            .clientId(clientId)
            .clientSecret(clientSecret)
            .authorizationUri(authUrl)
            .build());
  }

}

