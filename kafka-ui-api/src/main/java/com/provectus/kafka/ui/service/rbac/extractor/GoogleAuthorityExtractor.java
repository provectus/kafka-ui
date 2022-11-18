package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import reactor.core.publisher.Mono;

@Slf4j
public class GoogleAuthorityExtractor implements ProviderAuthorityExtractor {

  private static final String GOOGLE_DOMAIN_ATTRIBUTE_NAME = "hd";
  public static final String EMAIL_ATTRIBUTE_NAME = "email";

  @Override
  public boolean isApplicable(String provider) {
    return Provider.Name.GOOGLE.equalsIgnoreCase(provider);
  }

  @Override
  public Mono<List<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    log.debug("Extracting google user authorities");

    DefaultOAuth2User principal;
    try {
      principal = (DefaultOAuth2User) value;
    } catch (ClassCastException e) {
      log.error("Can't cast value to DefaultOAuth2User", e);
      throw new RuntimeException();
    }

    List<String> groupsByUsername = acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH_GOOGLE))
            .filter(s -> s.getType().equals("user"))
            .anyMatch(s -> s.getValue().equals(principal.getAttribute(EMAIL_ATTRIBUTE_NAME))))
        .map(Role::getName)
        .collect(Collectors.toList());


    String domain = principal.getAttribute(GOOGLE_DOMAIN_ATTRIBUTE_NAME);
    if (domain == null) {
      log.debug("Google domain param is not present");
      return Mono.just(groupsByUsername);
    }

    List<String> groupsByDomain = acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH_GOOGLE))
            .filter(s -> s.getType().equals("domain"))
            .anyMatch(s -> s.getValue().equals(domain)))
        .map(Role::getName)
        .toList();

    return Mono.just(Stream.concat(groupsByUsername.stream(), groupsByDomain.stream())
        .collect(Collectors.toList()));
  }

}
