package com.provectus.kafka.ui.service.rbac.extractor;

import static com.provectus.kafka.ui.model.rbac.provider.Provider.Name.GOOGLE;

import com.google.common.collect.Sets;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import reactor.core.publisher.Mono;

@Slf4j
public class GoogleAuthorityExtractor implements ProviderAuthorityExtractor {

  private static final String GOOGLE_DOMAIN_ATTRIBUTE_NAME = "hd";
  public static final String EMAIL_ATTRIBUTE_NAME = "email";

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
    return GOOGLE.equalsIgnoreCase(provider) || GOOGLE.equalsIgnoreCase(customParams.get(TYPE));
  }

  @Override
  public Mono<Set<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    log.debug("Extracting google user authorities");

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
            .filter(s -> s.getProvider().equals(Provider.OAUTH_GOOGLE))
            .filter(s -> s.getType().equals("user"))
            .anyMatch(s -> s.getValue().equals(principal.getAttribute(EMAIL_ATTRIBUTE_NAME))))
        .map(Role::getName)
        .collect(Collectors.toSet());


    String domain = principal.getAttribute(GOOGLE_DOMAIN_ATTRIBUTE_NAME);
    if (domain == null) {
      log.debug("Google domain param is not present");
      return Mono.just(groupsByUsername);
    }

    Set<String> groupsByDomain = acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH_GOOGLE))
            .filter(s -> s.getType().equals("domain"))
            .anyMatch(s -> s.getValue().equals(domain)))
        .map(Role::getName)
        .collect(Collectors.toSet());

    return Mono.just(Sets.union(groupsByUsername, groupsByDomain));
  }

}
