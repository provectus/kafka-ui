package com.provectus.kafka.ui.config.auth;

import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.Assert;

@ConfigurationProperties("auth.oauth2")
@Data
public class OAuthProperties {
  private Map<String, OAuth2Provider> client = new HashMap<>();

  @PostConstruct
  public void init() {
    getClient().values().forEach((provider) -> {
      if (provider.getCustomParams() == null) {
        provider.setCustomParams(Collections.emptyMap());
      }
      if (provider.getScope() == null) {
        provider.setScope(Collections.emptySet());
      }
    });

    getClient().values().forEach(this::validateProvider);
  }

  private void validateProvider(final OAuth2Provider provider) {
    Assert.hasText(provider.getClientId(), "Client id must not be empty.");
    Assert.hasText(provider.getProvider(), "Provider name must not be empty");
  }

  @Data
  public static class OAuth2Provider {
    private String provider;
    private String clientId;
    private String clientSecret;
    private String clientName;
    private String redirectUri;
    private String authorizationGrantType;
    private Set<String> scope;
    private String issuerUri;
    private String authorizationUri;
    private String tokenUri;
    private String userInfoUri;
    private String jwkSetUri;
    private String userNameAttribute;
    private Map<String, String> customParams;
  }
}
