package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.actuate.endpoint.Sanitizer;

class KafkaConfigSanitizerTest {

  @Test
  void obfuscateCredentials() {
    final Sanitizer sanitizer = new KafkaConfigSanitizer();
    assertThat(sanitizer.sanitize("sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("consumer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("producer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("main.consumer.sasl.jaas.config", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("database.password", "secret")).isEqualTo("******");
    assertThat(sanitizer.sanitize("basic.auth.user.info", "secret")).isEqualTo("******");
  }

  @Test
  void notObfuscateNormalConfigs() {
    final Sanitizer sanitizer = new KafkaConfigSanitizer();
    assertThat(sanitizer.sanitize("security.protocol", "SASL_SSL")).isEqualTo("SASL_SSL");
    final String[] bootstrapServer = new String[] {"test1:9092", "test2:9092"};
    assertThat(sanitizer.sanitize("bootstrap.servers", bootstrapServer)).isEqualTo(bootstrapServer);
  }
}
