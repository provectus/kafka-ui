package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
public class LdapAuthorityExtractor implements ProviderAuthorityExtractor {

  @Override
  public boolean isApplicable(String provider) {
    return false; // TODO #2752
  }

  @Override
  public Mono<Set<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    return Mono.just(Collections.emptySet()); // TODO #2752
  }

}
