package com.provectus.kafka.ui.config.auth.props;

import lombok.ToString;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(value = "auth.type", havingValue = "OAUTH2_COGNITO")
@ToString(exclude = "clientSecret")
public class CognitoProperties {

  private final String clientId;
  private final String logoutUrl;
  private final String issuerUrl;
  private final String clientSecret;
  @Nullable
  private final String scope;
  @Nullable
  private final String userNameAttribute;

  @Autowired
  public CognitoProperties(Environment env) {
    this.clientId = env.getRequiredProperty("auth.cognito.client-id");
    this.logoutUrl = env.getRequiredProperty("auth.cognito.logout-uri");
    this.issuerUrl = env.getRequiredProperty("auth.cognito.issuer-uri");
    this.clientSecret = env.getRequiredProperty("auth.cognito.client-secret");
    this.scope = env.getProperty("auth.cognito.scope");
    this.userNameAttribute = env.getProperty("auth.cognito.user-name-attribute");
  }

  public String getClientId() {
    return clientId;
  }

  public String getLogoutUrl() {
    return logoutUrl;
  }

  public String getIssuerUrl() {
    return issuerUrl;
  }

  public String getClientSecret() {
    return clientSecret;
  }

  public @Nullable String getScope() {
    return scope;
  }

  public @Nullable String getUserNameAttribute() {
    return userNameAttribute;
  }

}
