package com.provectus.kafka.ui.service.rbac.extractor;

import static com.provectus.kafka.ui.model.rbac.provider.Provider.Name.OAUTH;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.config.auth.OAuthProperties;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import reactor.core.publisher.Mono;

@Slf4j
public class OauthAuthorityExtractor implements ProviderAuthorityExtractor {

  public static final String ROLES_FIELD_PARAM_NAME = "roles-field";

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
    var containsRolesFieldNameParam = customParams.containsKey(ROLES_FIELD_PARAM_NAME);
    if (!containsRolesFieldNameParam) {
      log.debug("Provider [{}] doesn't contain a roles field param name, mapping won't be performed", provider);
      return false;
    }

    return OAUTH.equalsIgnoreCase(provider) || OAUTH.equalsIgnoreCase(customParams.get(TYPE));
  }

  @Override
  public Mono<Set<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    log.debug("Extracting OAuth2 user authorities");

    DefaultOAuth2User principal;
    try {
      principal = (DefaultOAuth2User) value;
    } catch (ClassCastException e) {
      log.error("Can't cast value to DefaultOAuth2User", e);
      throw new RuntimeException();
    }

    var provider = (OAuthProperties.OAuth2Provider) additionalParams.get("provider");
    var rolesFieldName = provider.getCustomParams().get(ROLES_FIELD_PARAM_NAME);

    Set<String> rolesByUsername = acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH))
            .filter(s -> s.getType().equals("user"))
            .anyMatch(s -> s.getValue().equals(principal.getName())))
        .map(Role::getName)
        .collect(Collectors.toSet());

    Set<String> rolesByRolesField = acs.getRoles()
        .stream()
        .filter(role -> role.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH))
            .filter(s -> s.getType().equals("role"))
            .anyMatch(subject
                -> {
              var principalRoles = convertRoles(principal.getAttribute(rolesFieldName));
              var roleName = subject.getValue();
              return principalRoles.contains(roleName);
            })
        )
        .map(Role::getName)
        .collect(Collectors.toSet());

    return Mono.just(Stream.concat(rolesByUsername.stream(), rolesByRolesField.stream()).collect(Collectors.toSet()));
  }

  @SuppressWarnings("unchecked")
  private Collection<String> convertRoles(Object roles) {
    if (roles == null) {
      log.debug("Param missing from attributes, skipping");
      return Collections.emptySet();
    }

    try {
      if ((roles instanceof List<?>) || (roles instanceof Set<?>)) {
        log.trace("The field is either a set or a list, returning as is");
        return (Collection<String>) roles;
      }

      if (!(roles instanceof String)) {
        log.debug("The field is not a string, skipping");
        return Collections.emptySet();
      }

      log.trace("Trying to deserialize the field");
      //@formatter:off
      return new ObjectMapper().readValue((String) roles, new TypeReference<>() {});
      //@formatter:on
    } catch (Exception e) {
      log.error("Error deserializing field", e);
      return Collections.emptySet();
    }
  }

}
