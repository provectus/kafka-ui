package com.provectus.kafka.ui.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.config.SslConfigs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.endpoint.Sanitizer;
import org.springframework.stereotype.Component;

@Component
class KafkaConfigSanitizer extends Sanitizer {
  private static final List<String> DEFAULT_PATTERNS_TO_SANITIZE = Arrays.asList(
      "basic.auth.user.info",  /* For Schema Registry credentials */
      "password", "secret", "token", "key", ".*credentials.*"  /* General credential patterns */
  );

  KafkaConfigSanitizer(
      @Value("${kafka.config.sanitizer.enabled:true}") boolean enabled,
      @Value("${kafka.config.sanitizer.patterns:}") List<String> patternsToSanitize
  ) {
    if (!enabled) {
      setKeysToSanitize();
    } else {
      var keysToSanitize = new HashSet<>(
          patternsToSanitize.isEmpty() ? DEFAULT_PATTERNS_TO_SANITIZE : patternsToSanitize);
      keysToSanitize.addAll(kafkaConfigKeysToSanitize());
      setKeysToSanitize(keysToSanitize.toArray(new String[]{}));
    }
  }

  private static Set<String> kafkaConfigKeysToSanitize() {
    final ConfigDef configDef = new ConfigDef();
    SslConfigs.addClientSslSupport(configDef);
    SaslConfigs.addClientSaslSupport(configDef);
    return configDef.configKeys().entrySet().stream()
        .filter(entry -> entry.getValue().type().equals(ConfigDef.Type.PASSWORD))
        .map(Map.Entry::getKey)
        .collect(Collectors.toSet());
  }

}
