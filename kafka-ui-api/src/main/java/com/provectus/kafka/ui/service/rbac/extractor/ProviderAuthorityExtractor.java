package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Mono;

public interface ProviderAuthorityExtractor {

  boolean isApplicable(String provider);

  Mono<List<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams);

}
