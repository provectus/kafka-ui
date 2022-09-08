package com.provectus.kafka.ui.config.auth.props;

import lombok.Data;
import lombok.ToString;
import org.jetbrains.annotations.Nullable;

@Data
@ToString(exclude = "clientSecret")
public class CognitoProperties {

  String clientId;
  String logoutUri;
  String issuerUri;
  String clientSecret;
  @Nullable
  String scope;
  @Nullable
  String userNameAttribute;

  public String getClientId() {
    return clientId;
  }

  public String getLogoutUri() {
    return logoutUri;
  }

  public String getIssuerUri() {
    return issuerUri;
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
