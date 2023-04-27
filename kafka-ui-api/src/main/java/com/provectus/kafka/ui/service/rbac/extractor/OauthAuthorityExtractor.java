package com.provectus.kafka.ui.service.rbac.extractor;

import static com.provectus.kafka.ui.model.rbac.provider.Provider.Name.OAUTH;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
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

    Set<String> groupsByUsername = acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH))
            .filter(s -> s.getType().equals("user"))
            .anyMatch(s -> s.getValue().equals(principal.getName())))
        .map(Role::getName)
        .collect(Collectors.toSet());

    Set<String> groupsByGroupField = acs.getRoles()
        .stream()
        .filter(role -> role.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH))
            .filter(s -> s.getType().equals("groupsfield"))
            .anyMatch(subject -> convertGroups(principal.getAttribute(subject.getValue())).contains(role.getName()))
        )
        //subject.getValue()
        .map(Role::getName)
        .collect(Collectors.toSet());

    return Mono.just(Stream.concat(groupsByUsername.stream(), groupsByGroupField.stream()).collect(Collectors.toSet()));
  }

  @SuppressWarnings("unchecked")
  private Collection<String> convertGroups(Object groups) {
    try {
      if ((groups instanceof List<?>) || (groups instanceof Set<?>)) {
        log.trace("The field is either a set or a list, returning as is");
        return (Collection<String>) groups;
      }

      if (!(groups instanceof String)) {
        log.debug("The field is not a string, skipping");
        return Collections.emptySet();
      }

      log.trace("Trying to deserialize the field");
      //@formatter:off
      return new ObjectMapper().readValue((String) groups, new TypeReference<>() {});
      //@formatter:on
    } catch (Exception e) {
      log.error("Error deserializing field", e);
      return Collections.emptySet();
    }
  }

}
