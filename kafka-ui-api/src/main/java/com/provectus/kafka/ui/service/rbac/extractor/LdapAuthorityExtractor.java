package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
public class LdapAuthorityExtractor implements ProviderAuthorityExtractor {

  @Override
  public boolean isApplicable(String provider) {
    return false; // TODO #2752
  }

  @Override
  public Mono<List<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    return Mono.just(Collections.emptyList()); // TODO #2752
  }

}
