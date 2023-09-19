package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.config.auth.logout.OAuth2ServerLogoutSuccessHandler;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import com.provectus.kafka.ui.service.rbac.extractor.ProviderAuthorityExtractor;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.jetbrains.annotations.Nullable;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientPropertiesMapper;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import reactor.core.publisher.Mono;

@Configuration
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
@EnableConfigurationProperties(OAuthProperties.class)
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
@Log4j2
public class OAuthSecurityConfig extends AbstractAuthSecurityConfig {

  private final OAuthProperties properties;

  @Bean
  public SecurityWebFilterChain configure(ServerHttpSecurity http, OAuth2ServerLogoutSuccessHandler logoutHandler) {
    log.info("Configuring OAUTH2 authentication.");

    return http.authorizeExchange(spec -> spec
            .pathMatchers(AUTH_WHITELIST)
            .permitAll()
            .anyExchange()
            .authenticated()
        )
        .oauth2Login(Customizer.withDefaults())
        .logout(spec -> spec.logoutSuccessHandler(logoutHandler))
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .build();
  }

  @Bean
  public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> customOidcUserService(AccessControlService acs) {
    final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();
    return request -> delegate.loadUser(request)
        .flatMap(user -> {
          var provider = getProviderByProviderId(request.getClientRegistration().getRegistrationId());
          final var extractor = getExtractor(provider, acs);
          if (extractor == null) {
            return Mono.just(user);
          }

          return extractor.extract(acs, user, Map.of("request", request, "provider", provider))
              .map(groups -> new RbacOidcUser(user, groups));
        });
  }

  @Bean
  public ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> customOauth2UserService(AccessControlService acs) {
    final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();
    return request -> delegate.loadUser(request)
        .flatMap(user -> {
          var provider = getProviderByProviderId(request.getClientRegistration().getRegistrationId());
          final var extractor = getExtractor(provider, acs);
          if (extractor == null) {
            return Mono.just(user);
          }

          return extractor.extract(acs, user, Map.of("request", request, "provider", provider))
              .map(groups -> new RbacOAuth2User(user, groups));
        });
  }

  @Bean
  public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository() {
    final OAuth2ClientProperties props = OAuthPropertiesConverter.convertProperties(properties);
    final List<ClientRegistration> registrations =
        new ArrayList<>(new OAuth2ClientPropertiesMapper(props).asClientRegistrations().values());
    if (registrations.isEmpty()) {
      throw new IllegalArgumentException("OAuth2 authentication is enabled but no providers specified.");
    }
    return new InMemoryReactiveClientRegistrationRepository(registrations);
  }

  @Bean
  public ServerLogoutSuccessHandler defaultOidcLogoutHandler(final ReactiveClientRegistrationRepository repository) {
    return new OidcClientInitiatedServerLogoutSuccessHandler(repository);
  }

  @Nullable
  private ProviderAuthorityExtractor getExtractor(final OAuthProperties.OAuth2Provider provider,
                                                  AccessControlService acs) {
    Optional<ProviderAuthorityExtractor> extractor = acs.getOauthExtractors()
        .stream()
        .filter(e -> e.isApplicable(provider.getProvider(), provider.getCustomParams()))
        .findFirst();

    return extractor.orElse(null);
  }

  private OAuthProperties.OAuth2Provider getProviderByProviderId(final String providerId) {
    return properties.getClient().get(providerId);
  }

}

