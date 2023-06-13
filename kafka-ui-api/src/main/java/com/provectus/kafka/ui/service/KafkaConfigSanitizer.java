package com.provectus.kafka.ui.service;

import static java.util.regex.Pattern.CASE_INSENSITIVE;

import com.google.common.collect.ImmutableList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.config.SslConfigs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
class KafkaConfigSanitizer {

  private static final String SANITIZED_VALUE = "******";

  private static final String[] REGEX_PARTS = {"*", "$", "^", "+"};

  private static final List<String> DEFAULT_PATTERNS_TO_SANITIZE = ImmutableList.<String>builder()
      .addAll(kafkaConfigKeysToSanitize())
      .add(
          "basic.auth.user.info",  /* For Schema Registry credentials */
          "password", "secret", "token", "key", ".*credentials.*",   /* General credential patterns */
          "aws.access.*", "aws.secret.*", "aws.session.*"   /* AWS-related credential patterns */
      )
      .build();

  private final List<Pattern> sanitizeKeysPatterns;

  KafkaConfigSanitizer(
      @Value("${kafka.config.sanitizer.enabled:true}") boolean enabled,
      @Value("${kafka.config.sanitizer.patterns:}") List<String> patternsToSanitize
  ) {
    this.sanitizeKeysPatterns = enabled
        ? compile(patternsToSanitize.isEmpty() ? DEFAULT_PATTERNS_TO_SANITIZE : patternsToSanitize)
        : List.of();
  }

  private static List<Pattern> compile(Collection<String> patternStrings) {
    return patternStrings.stream()
        .map(p -> isRegex(p)
            ? Pattern.compile(p, CASE_INSENSITIVE)
            : Pattern.compile(".*" + p + "$", CASE_INSENSITIVE))
        .toList();
  }

  private static boolean isRegex(String str) {
    return Arrays.stream(REGEX_PARTS).anyMatch(str::contains);
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

  @Nullable
  public Object sanitize(String key, @Nullable Object value) {
    for (Pattern pattern : sanitizeKeysPatterns) {
      if (pattern.matcher(key).matches()) {
        return SANITIZED_VALUE;
      }
    }
    return value;
  }

  public Map<String, Object> sanitizeConnectorConfig(@Nullable Map<String, Object> original) {
    var result = new HashMap<String, Object>(); //null-values supporting map!
    if (original != null) {
      original.forEach((k, v) -> result.put(k, sanitize(k, v)));
    }
    return result;
  }

}
