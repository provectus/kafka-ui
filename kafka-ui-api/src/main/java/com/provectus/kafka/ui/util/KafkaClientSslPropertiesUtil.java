package com.provectus.kafka.ui.util;

import static org.apache.kafka.common.config.SslConfigs.SSL_ENGINE_FACTORY_CLASS_CONFIG;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.Properties;
import javax.annotation.Nullable;
import org.apache.kafka.common.config.SslConfigs;

public final class KafkaClientSslPropertiesUtil {

  private KafkaClientSslPropertiesUtil() {
  }

  public static void addKafkaSslProperties(@Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                           Properties sink) {
    if (truststoreConfig == null) {
      return;
    }

    if (!truststoreConfig.isVerifySsl()) {
      sink.put(SSL_ENGINE_FACTORY_CLASS_CONFIG, InsecureSslEngineFactory.class);
      return;
    }

    if (truststoreConfig.getTruststoreLocation() == null) {
      return;
    }

    sink.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, truststoreConfig.getTruststoreLocation());

    if (truststoreConfig.getTruststorePassword() != null) {
      sink.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, truststoreConfig.getTruststorePassword());
    }
  }

}
