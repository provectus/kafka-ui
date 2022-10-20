package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import reactor.core.publisher.Mono;

@Slf4j
public class OauthAuthorityExtractor implements ProviderAuthorityExtractor {

  @Override
  public boolean isApplicable(String provider) {
    return false; // TODO
  }

  @Override
  public Mono<List<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    DefaultOAuth2User principal;
    try {
      principal = (DefaultOAuth2User) value;
    } catch (ClassCastException e) {
      log.error("Can't cast value to DefaultOAuth2User", e);
      throw new RuntimeException();
    }

    return Mono.just(List.of(principal.getName())); // TODO
  }

}
