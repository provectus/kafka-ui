package com.provectus.kafka.ui.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.config.SslConfigs;
import org.springframework.boot.actuate.endpoint.Sanitizer;
import org.springframework.stereotype.Service;

@Service
class KafkaConfigSanitizer extends Sanitizer {
  private static final List<String> OTHER_KEYS_TO_SANITIZE = Arrays.asList(
      "basic.auth.user.info",  /* For Schema Registry credentials */
      "password", "secret", "token", "key", ".*credentials.*"  /* General credential patterns */
  );

  KafkaConfigSanitizer() {
    final ConfigDef configDef = new ConfigDef();
    SslConfigs.addClientSslSupport(configDef);
    SaslConfigs.addClientSaslSupport(configDef);
    final Set<String> keysToSanitize = configDef.configKeys().entrySet().stream()
            .filter(entry -> entry.getValue().type().equals(ConfigDef.Type.PASSWORD))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    keysToSanitize.addAll(OTHER_KEYS_TO_SANITIZE);
    this.setKeysToSanitize(keysToSanitize.toArray(new String[0]));
  }
}
