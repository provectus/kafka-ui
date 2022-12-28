package com.provectus.kafka.ui.config.auth.logout;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2")
public class OAuthLogoutSuccessHandler implements ServerLogoutSuccessHandler {
  private final OAuthProperties properties;
  private final List<LogoutSuccessHandler> logoutSuccessHandlers;
  private final ServerLogoutSuccessHandler defaultOidcLogoutHandler;

  public OAuthLogoutSuccessHandler(final OAuthProperties properties,
                                   final List<LogoutSuccessHandler> logoutSuccessHandlers,
                                   final @Qualifier("defaultOidcLogoutHandler") ServerLogoutSuccessHandler handler) {
    this.properties = properties;
    this.logoutSuccessHandlers = logoutSuccessHandlers;
    this.defaultOidcLogoutHandler = handler;
  }

  @Override
  public Mono<Void> onLogoutSuccess(final WebFilterExchange exchange,
                                    final Authentication authentication) {
    final OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
    final String providerId = oauthToken.getAuthorizedClientRegistrationId();
    final OAuthProperties.OAuth2Provider oAuth2Provider = properties.getClient().get(providerId);
    return getLogoutHandler(oAuth2Provider.getProvider())
        .map(handler -> handler.handle(exchange, authentication, oAuth2Provider))
        .orElseGet(() -> defaultOidcLogoutHandler.onLogoutSuccess(exchange, authentication));
  }

  private Optional<LogoutSuccessHandler> getLogoutHandler(final String provider) {
    return logoutSuccessHandlers.stream()
        .filter(h -> h.isApplicable(provider))
        .findFirst();
  }
}
