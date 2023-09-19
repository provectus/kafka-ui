package com.provectus.kafka.ui.config.auth.logout;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import com.provectus.kafka.ui.config.auth.condition.OAuthCondition;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import java.net.URI;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import lombok.Getter;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@Conditional(OAuthCondition.class)
public class OAuthLogoutSuccessHandler extends QueryParamsLogoutSuccessHandler {

  @Getter
  private enum Attributes {
    CLIENT_ID_KEY("client-id-key"),
    LOGOUT_URL("logout-url"),
    REDIRECT_URL("redirect-url"),
    REDIRECT_URL_KEY("redirect-url-key"),
    REDIRECT_URL_STRIP_SLASH("redirect-url-strip-slash");

    private final String value;

    Attributes(String value) {
      this.value = value;
    }
  }

  private final Set<String> attributes = Set.of(Arrays.stream(Attributes.values()).map(Attributes::getValue)
      .toArray(String[]::new));

  private final Set<String> trueValues = Set.of("on", "true", "1", "yes");

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
    // oauth type is used for ACL too, so check if there is any of our attributes
    return (Provider.Name.OAUTH.equalsIgnoreCase(customParams.getOrDefault("type", null))
                || Provider.Name.OAUTH.equalsIgnoreCase(provider))
        && attributes.stream().anyMatch(customParams::containsKey);
  }

  @Override
  protected URI buildRedirect(WebFilterExchange exchange, UriComponents baseUrl,
                              OAuthProperties.OAuth2Provider provider, ClientRegistration clientRegistration) {
    URI logoutUrl = null;

    if (provider.getCustomParams().containsKey(Attributes.LOGOUT_URL.getValue())) {
      logoutUrl = URI.create(provider.getCustomParams().get(Attributes.LOGOUT_URL.getValue()));
    }

    if (logoutUrl == null && clientRegistration != null) {
      Object endSessionEndpoint = clientRegistration.getProviderDetails().getConfigurationMetadata()
          .get("end_session_endpoint");
      if (endSessionEndpoint != null) {
        logoutUrl = URI.create(endSessionEndpoint.toString());
      }
    }

    Assert.notNull(logoutUrl, "Cannot determine logout URL, custom params should contain 'logout-url'");

    var params = new LinkedMultiValueMap<String, String>();

    if (provider.getCustomParams().containsKey(Attributes.CLIENT_ID_KEY.getValue())) {
      params.add(provider.getCustomParams().get(Attributes.CLIENT_ID_KEY.getValue()), provider.getClientId());
    }


    if (provider.getCustomParams().containsKey(Attributes.REDIRECT_URL_KEY.getValue())) {
      String redirectUrl = provider.getCustomParams().getOrDefault(Attributes.REDIRECT_URL.getValue(),
                                                                   baseUrl.toString());

      if (provider.getCustomParams().containsKey(Attributes.REDIRECT_URL_STRIP_SLASH.getValue())) {
        var stripSlashValue = String.valueOf(provider.getCustomParams()
            .get(Attributes.REDIRECT_URL_STRIP_SLASH.getValue())).toLowerCase();

        if (trueValues.contains(stripSlashValue)) {
          redirectUrl = stripSlash(redirectUrl);
        }
      }

      params.add(provider.getCustomParams().get(Attributes.REDIRECT_URL_KEY.getValue()), redirectUrl);
    }

    return createRedirectUrl(logoutUrl, params);
  }

  private String stripSlash(String url) {
    URI parsedUrl = URI.create(url);
    if (parsedUrl.isAbsolute() && parsedUrl.getPath().endsWith("/")) {
      return UriComponentsBuilder.fromUri(parsedUrl).replacePath(
          parsedUrl.getPath().substring(0, parsedUrl.getPath().length() - 1)).build().toString();
    } else {
      return url;
    }
  }
}
