package com.provectus.kafka.ui.config.auth.logout;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

public abstract class QueryParamsLogoutSuccessHandler implements LogoutSuccessHandler {

  @Override
  public Mono<Void> handle(WebFilterExchange exchange, Authentication authentication,
                           OAuthProperties.OAuth2Provider provider, ClientRegistration clientRegistration) {
    final var request = exchange.getExchange().getRequest();
    final var requestUri = request.getURI();
    final var contextPath = request.getPath().contextPath().value();

    final UriComponents baseUrl = UriComponentsBuilder
        .fromUri(requestUri)
        .replacePath(contextPath)
        .replaceQuery(null)
        .fragment(null)
        .build();

    final var redirectUrl = buildRedirect(exchange, baseUrl, provider, clientRegistration);

    final ServerHttpResponse response = exchange.getExchange().getResponse();
    response.setStatusCode(HttpStatus.FOUND);
    response.getHeaders().setLocation(redirectUrl);
    return exchange.getExchange().getSession().flatMap(WebSession::invalidate);
  }

  protected abstract URI buildRedirect(WebFilterExchange exchange, UriComponents baseUrl,
                                       OAuthProperties.OAuth2Provider provider,
                                       ClientRegistration clientRegistration);

  protected URI createRedirectUrl(URI logoutUrl, MultiValueMap<String, String> params) {
    return UriComponentsBuilder.fromUri(logoutUrl)
        .encode(StandardCharsets.UTF_8)
        .replaceQueryParams(params)
        .fragment(null)
        .build()
        .toUri();
  }
}
