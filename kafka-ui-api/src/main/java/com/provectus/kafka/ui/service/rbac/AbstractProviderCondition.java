package com.provectus.kafka.ui.service.rbac;

import com.provectus.kafka.ui.config.auth.OAuthProperties;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.Environment;

public abstract class AbstractProviderCondition {
  private static final Bindable<Map<String, OAuthProperties.OAuth2Provider>> OAUTH2_PROPERTIES = Bindable
      .mapOf(String.class, OAuthProperties.OAuth2Provider.class);

  protected Set<String> getRegisteredProvidersTypes(final Environment env) {
    final Map<String, OAuthProperties.OAuth2Provider> properties = Binder.get(env)
        .bind("auth.oauth2.client", OAUTH2_PROPERTIES)
        .orElse(Map.of());
    return properties.values().stream()
        .map(OAuthProperties.OAuth2Provider::getCustomParams)
        .filter(Objects::nonNull)
        .filter(Predicate.not(Map::isEmpty))
        .map(params -> params.getOrDefault("type", null))
        .filter(Objects::nonNull)
        .filter(StringUtils::isNotEmpty)
        .collect(Collectors.toSet());
  }
}
