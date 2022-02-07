package com.provectus.kafka.ui.util;

import static com.provectus.kafka.ui.util.KafkaConstants.TRUSTSTORE_LOCATION;
import static com.provectus.kafka.ui.util.KafkaConstants.TRUSTSTORE_PASSWORD;

import java.util.Properties;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.config.SslConfigs;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaSslManager {

  private final Environment environment;

  public Properties getSslProperties() {
    final var properties = new Properties();
    properties.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, environment.getProperty(TRUSTSTORE_LOCATION));
    properties.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, environment.getProperty(TRUSTSTORE_PASSWORD));
    return properties;
  }

}
