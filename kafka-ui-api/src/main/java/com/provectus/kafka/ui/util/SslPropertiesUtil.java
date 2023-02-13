package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.util.Properties;
import javax.annotation.Nullable;
import lombok.experimental.UtilityClass;
import org.apache.kafka.common.config.SslConfigs;

@UtilityClass
public class SslPropertiesUtil {

  public void addKafkaSslProperties(@Nullable ClustersProperties.Ssl ssl, Properties properties) {
    if (ssl != null) {
      properties.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, ssl.getTruststoreLocation());
      properties.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, ssl.getTruststorePassword());
      properties.put(SslConfigs.SSL_KEYSTORE_LOCATION_CONFIG, ssl.getKeystoreLocation());
      properties.put(SslConfigs.SSL_KEYSTORE_PASSWORD_CONFIG, ssl.getKeystorePassword());
    }
  }

}
