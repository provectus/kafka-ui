package com.provectus.kafka.ui.config.auth.logout;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.web.server.WebFilterExchange;
import reactor.core.publisher.Mono;

public interface LogoutSuccessHandler {

  boolean isApplicable(final String provider, final Map<String, String> customParams);

  Mono<Void> handle(final WebFilterExchange exchange,
                    final Authentication authentication,
                    final OAuthProperties.OAuth2Provider provider, ClientRegistration clientRegistration);
}
