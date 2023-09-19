package com.provectus.kafka.ui.config.auth.logout;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import com.provectus.kafka.ui.config.auth.condition.CognitoCondition;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import java.net.URI;
import java.util.Map;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.util.UriComponents;

@Component
@Conditional(CognitoCondition.class)
public class CognitoLogoutSuccessHandler extends QueryParamsLogoutSuccessHandler {

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
    return Provider.Name.COGNITO.equalsIgnoreCase(customParams.getOrDefault("type", null));
  }

  @Override
  protected URI buildRedirect(WebFilterExchange exchange, UriComponents baseUrl,
                              OAuthProperties.OAuth2Provider provider, ClientRegistration clientRegistration) {

    Assert.isTrue(provider.getCustomParams().containsKey("logoutUrl"),
        "Custom params should contain 'logoutUrl'");

    URI logoutUrl = URI.create(provider.getCustomParams().get("logoutUrl"));

    var params = new LinkedMultiValueMap<String, String>();
    params.add("client_id", provider.getClientId());
    params.add("logout_uri", baseUrl.toString());

    return createRedirectUrl(logoutUrl, params);
  }

}

