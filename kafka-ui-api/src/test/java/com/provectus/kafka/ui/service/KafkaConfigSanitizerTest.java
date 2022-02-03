package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.springframework.boot.actuate.endpoint.Sanitizer;

class KafkaConfigSanitizerTest {

  @Test
  void doNothingIfEnabledPropertySetToFalse() {
    final Sanitizer sanitizer = new KafkaConfigSanitizer(false, Collections.emptyList());
    assertThat(sanitizer.sanitize("password", "secret")).isEqualTo("secret");
    assertThat(sanitizer.sanitize("sasl.jaas.config", "secret")).isEqualTo("secret");
    assertThat(sanitizer.sanitize("database.password", "secret")).isEqualTo("secret");
  }

  @Test
  void obfuscateCredentials() {
    final Sanitizer sanitizer = new KafkaConfigSanitizer(true, Collections.emptyList());
    assertThat(sanitizer.sanitize("sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("consumer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("producer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("main.consumer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("database.password", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("basic.auth.user.info", "secret")).isEqualTo("******");
  }

  @Test
  void notObfuscateNormalConfigs() {
    final Sanitizer sanitizer = new KafkaConfigSanitizer(true, Collections.emptyList());
    assertThat(sanitizer.sanitize("security.protocol", "SASL_SSL")).isEqualTo("SASL_SSL");
    final String[] bootstrapServer = new String[] {"test1:9092", "test2:9092"};
    assertThat(sanitizer.sanitize("bootstrap.servers", bootstrapServer)).isEqualTo(bootstrapServer);
  }

  @Test
  void obfuscateCredentialsWithDefinedPatterns() {
    final Sanitizer sanitizer = new KafkaConfigSanitizer(true, Arrays.asList("kafka.ui", ".*test.*"));
    assertThat(sanitizer.sanitize("consumer.kafka.ui", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("this.is.test.credentials", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("this.is.not.credential", "not.credential"))
            .isEqualTo("not.credential");
    assertThat(sanitizer.sanitize("database.password", "no longer credential"))
            .isEqualTo("no longer credential");
  }
}
