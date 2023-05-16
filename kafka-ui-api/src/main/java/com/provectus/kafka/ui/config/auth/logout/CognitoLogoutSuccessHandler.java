package com.provectus.kafka.ui.config.auth.logout;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import com.provectus.kafka.ui.config.auth.condition.CognitoCondition;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.web.server.WebSession;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

@Component
@Conditional(CognitoCondition.class)
public class CognitoLogoutSuccessHandler implements LogoutSuccessHandler {

  @Override
  public boolean isApplicable(String provider) {
    return Provider.Name.COGNITO.equalsIgnoreCase(provider);
  }

  @Override
  public Mono<Void> handle(WebFilterExchange exchange, Authentication authentication,
                           OAuthProperties.OAuth2Provider provider) {
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

    Assert.isTrue(provider.getCustomParams().containsKey("logoutUrl"),
        "Custom params should contain 'logoutUrl'");
    final var uri = UriComponentsBuilder
        .fromUri(URI.create(provider.getCustomParams().get("logoutUrl")))
        .queryParam("client_id", provider.getClientId())
        .queryParam("logout_uri", baseUrl)
        .encode(StandardCharsets.UTF_8)
        .build()
        .toUri();

    response.getHeaders().setLocation(uri);
    return exchange.getExchange().getSession().flatMap(WebSession::invalidate);
  }

}

