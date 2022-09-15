package com.provectus.kafka.ui.config;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class CognitoOidcLogoutSuccessHandler implements ServerLogoutSuccessHandler {

  private final String logoutUrl;
  private final String clientId;

  @Override
  public Mono<Void> onLogoutSuccess(final WebFilterExchange exchange, final Authentication authentication) {
    final ServerHttpResponse response = exchange.getExchange().getResponse();
    response.setStatusCode(HttpStatus.FOUND);

    final var requestUri = exchange.getExchange().getRequest().getURI();

    final var fullUrl = UrlUtils.buildFullRequestUrl(requestUri.getScheme(),
        requestUri.getHost(), requestUri.getPort(),
        requestUri.getPath(), requestUri.getQuery());

    final UriComponents baseUrl = UriComponentsBuilder
        .fromHttpUrl(fullUrl)
        .replacePath("/")
        .replaceQuery(null)
        .fragment(null)
        .build();

    final var uri = UriComponentsBuilder
        .fromUri(URI.create(logoutUrl))
        .queryParam("client_id", clientId)
        .queryParam("logout_uri", baseUrl)
        .encode(StandardCharsets.UTF_8)
        .build()
        .toUri();

    response.getHeaders().setLocation(uri);
    return exchange.getExchange().getSession().flatMap(WebSession::invalidate);
  }
}

