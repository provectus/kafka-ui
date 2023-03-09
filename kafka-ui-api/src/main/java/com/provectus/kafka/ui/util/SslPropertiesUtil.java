package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.config.ClustersProperties;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.util.Properties;
import javax.annotation.Nullable;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.apache.kafka.common.config.SslConfigs;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.util.ResourceUtils;
import reactor.netty.http.client.HttpClient;

@UtilityClass
public class SslPropertiesUtil {

  public void addKafkaSslProperties(@Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                    Properties sink) {
    if (truststoreConfig != null && truststoreConfig.getTruststoreLocation() != null) {
      sink.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, truststoreConfig.getTruststoreLocation());
      if (truststoreConfig.getTruststorePassword() != null) {
        sink.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, truststoreConfig.getTruststorePassword());
      }
    }
  }

}
