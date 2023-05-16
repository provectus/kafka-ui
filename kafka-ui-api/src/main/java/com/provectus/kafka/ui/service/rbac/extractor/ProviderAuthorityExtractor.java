package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Map;
import java.util.Set;
import reactor.core.publisher.Mono;

public interface ProviderAuthorityExtractor {

  String TYPE = "type";

  boolean isApplicable(String provider, Map<String, String> customParams);

  Mono<Set<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams);

}
