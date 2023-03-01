package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.Properties;
import javax.annotation.Nullable;
import lombok.experimental.UtilityClass;
import org.apache.kafka.common.config.SslConfigs;

@UtilityClass
public class SslPropertiesUtil {

  public void addKafkaSslProperties(@Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                    Properties properties) {
    if (truststoreConfig != null) {
      if (truststoreConfig.getTruststoreLocation() != null) {
        properties.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, truststoreConfig.getTruststoreLocation());
      }
      if (truststoreConfig.getTruststorePassword() != null) {
        properties.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, truststoreConfig.getTruststorePassword());
      }
    }
  }

}
