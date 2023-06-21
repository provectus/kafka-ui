package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class KafkaConfigSanitizerTest {

  @Test
  void doNothingIfEnabledPropertySetToFalse() {
    final var sanitizer = new KafkaConfigSanitizer(false, List.of());
    assertThat(sanitizer.sanitize("password", "secret")).isEqualTo("secret");
    assertThat(sanitizer.sanitize("sasl.jaas.config", "secret")).isEqualTo("secret");
    assertThat(sanitizer.sanitize("database.password", "secret")).isEqualTo("secret");
  }

  @Test
  void obfuscateCredentials() {
    final var sanitizer = new KafkaConfigSanitizer(true, List.of());
    assertThat(sanitizer.sanitize("sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("consumer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("producer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("main.consumer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("database.password", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("basic.auth.user.info", "secret")).isEqualTo("******");

    //AWS var sanitizing
    assertThat(sanitizer.sanitize("aws.access.key.id", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("aws.accessKeyId", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("aws.secret.access.key", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("aws.secretAccessKey", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("aws.sessionToken", "secret")).isEqualTo("******");
  }

  @Test
  void notObfuscateNormalConfigs() {
    final var sanitizer = new KafkaConfigSanitizer(true, List.of());
    assertThat(sanitizer.sanitize("security.protocol", "SASL_SSL")).isEqualTo("SASL_SSL");
    final String[] bootstrapServer = new String[] {"test1:9092", "test2:9092"};
    assertThat(sanitizer.sanitize("bootstrap.servers", bootstrapServer)).isEqualTo(bootstrapServer);
  }

  @Test
  void obfuscateCredentialsWithDefinedPatterns() {
    final var sanitizer = new KafkaConfigSanitizer(true, Arrays.asList("kafka.ui", ".*test.*"));
    assertThat(sanitizer.sanitize("consumer.kafka.ui", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("this.is.test.credentials", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("this.is.not.credential", "not.credential"))
            .isEqualTo("not.credential");
    assertThat(sanitizer.sanitize("database.password", "no longer credential"))
            .isEqualTo("no longer credential");
  }

  @Test
  void sanitizeConnectorConfigDoNotFailOnNullableValues() {
    Map<String, Object> originalConfig = new HashMap<>();
    originalConfig.put("password", "secret");
    originalConfig.put("asIs", "normal");
    originalConfig.put("nullVal", null);

    var sanitizedConfig = new KafkaConfigSanitizer(true, List.of())
        .sanitizeConnectorConfig(originalConfig);

    assertThat(sanitizedConfig)
        .hasSize(3)
        .containsEntry("password", "******")
        .containsEntry("asIs", "normal")
        .containsEntry("nullVal", null);
  }

}
