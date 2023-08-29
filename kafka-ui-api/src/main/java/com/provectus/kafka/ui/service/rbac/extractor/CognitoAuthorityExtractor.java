package com.provectus.kafka.ui.service.rbac.extractor;

import static com.provectus.kafka.ui.model.rbac.provider.Provider.Name.COGNITO;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import reactor.core.publisher.Mono;

@Slf4j
public class CognitoAuthorityExtractor implements ProviderAuthorityExtractor {

  private static final String COGNITO_GROUPS_ATTRIBUTE_NAME = "cognito:groups";

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
    return COGNITO.equalsIgnoreCase(provider) || COGNITO.equalsIgnoreCase(customParams.get(TYPE));
  }

  @Override
  public Mono<Set<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    log.debug("Extracting cognito user authorities");

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
            .filter(s -> s.getProvider().equals(Provider.OAUTH_COGNITO))
            .filter(s -> s.getType().equals("user"))
            .anyMatch(s -> s.getValue().equals(principal.getName())))
        .map(Role::getName)
        .collect(Collectors.toSet());

    List<String> groups = principal.getAttribute(COGNITO_GROUPS_ATTRIBUTE_NAME);
    if (groups == null) {
      log.debug("Cognito groups param is not present");
      return Mono.just(groupsByUsername);
    }

    Set<String> groupsByGroups = acs.getRoles()
        .stream()
        .filter(role -> role.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH_COGNITO))
            .filter(s -> s.getType().equals("group"))
            .anyMatch(subject -> groups
                .stream()
                .anyMatch(cognitoGroup -> cognitoGroup.equals(subject.getValue()))
            ))
        .map(Role::getName)
        .collect(Collectors.toSet());

    return Mono.just(Sets.union(groupsByUsername, groupsByGroups));
  }

}
