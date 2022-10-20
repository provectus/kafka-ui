package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.config.auth.logout.OAuthLogoutSuccessHandler;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import com.provectus.kafka.ui.service.rbac.extractor.ProviderAuthorityExtractor;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientPropertiesRegistrationAdapter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
  public SecurityWebFilterChain configure(ServerHttpSecurity http, OAuthLogoutSuccessHandler logoutHandler) {
    log.info("Configuring OAUTH2 authentication.");

    return http.authorizeExchange()
        .pathMatchers(AUTH_WHITELIST)
        .permitAll()
        .anyExchange()
        .authenticated()

        .and()
        .oauth2Login()

        .and()
        .oauth2Client()

        .and()
        .logout()
        .logoutSuccessHandler(logoutHandler)

        .and()
        .csrf().disable()
        .build();
  }

  @Bean
  public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> customOidcUserService(AccessControlService acs) {
    final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();
    return request -> delegate.loadUser(request)
        .flatMap(user -> {
          String providerId = request.getClientRegistration().getRegistrationId();
          final var extractor = getExtractor(providerId, acs);
          if (extractor == null) {
            return Mono.just(user);
          }

          return extractor.extract(acs, user, Map.of("request", request))
              .doOnNext(groups -> acs.cacheUser(new AuthenticatedUser(user.getName(), groups)))
              .thenReturn(user);
        });
  }

  @Bean
  public ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> customOauth2UserService(AccessControlService acs) {
    final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();
    return request -> delegate.loadUser(request)
        .flatMap(user -> {
          String providerId = request.getClientRegistration().getRegistrationId();
          final var extractor = getExtractor(providerId, acs);
          if (extractor == null) {
            return Mono.just(user);
          }

          return extractor.extract(acs, user, Map.of("request", request))
              .doOnNext(groups -> acs.cacheUser(new AuthenticatedUser(user.getName(), groups)))
              .thenReturn(user);
        });
  }

  @Bean
  public InMemoryReactiveClientRegistrationRepository clientRegistrationRepository() {
    final OAuth2ClientProperties props = OAuthPropertiesConverter.convertProperties(properties);
    final List<ClientRegistration> registrations =
        OAuth2ClientPropertiesRegistrationAdapter.getClientRegistrations(props).values().stream()
            .map(cr -> {
              final OAuthProperties.OAuth2Provider provider =
                  properties.getClient().get(cr.getRegistrationId());

              if (provider.getCustomParams().get("type").equalsIgnoreCase("google")) { // TODO
                String allowedDomain = provider.getCustomParams().get("allowedDomain");
                if (StringUtils.isNotEmpty(allowedDomain)) {
                  final String newUri =
                      cr.getProviderDetails().getAuthorizationUri() + "?hd=" + allowedDomain;
                  return ClientRegistration.withClientRegistration(cr).authorizationUri(newUri).build();
                }
              }
              return cr;
            })
            .collect(Collectors.toList());
    return new InMemoryReactiveClientRegistrationRepository(registrations);
  }

  @Bean
  public ServerLogoutSuccessHandler defaultOidcLogoutHandler(final ReactiveClientRegistrationRepository repository) {
    return new OidcClientInitiatedServerLogoutSuccessHandler(repository);
  }

  @Nullable
  private ProviderAuthorityExtractor getExtractor(final String providerId, AccessControlService acs) {
    final String provider = getProviderByProviderId(providerId);
    Optional<ProviderAuthorityExtractor> extractor = acs.getExtractors()
        .stream()
        .filter(e -> e.isApplicable(provider))
        .findFirst();

    return extractor.orElse(null);
  }

  private String getProviderByProviderId(final String providerId) {
    return properties.getClient().get(providerId).getProvider();
  }


}

