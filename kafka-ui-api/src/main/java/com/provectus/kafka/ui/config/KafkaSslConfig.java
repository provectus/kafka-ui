package com.provectus.kafka.ui.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.config.SslConfigs;
import org.apache.kafka.common.config.types.Password;
import org.apache.kafka.common.security.ssl.DefaultSslEngineFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class KafkaSslConfig {

  private final Map<String, Object> configsTrustStore = new HashMap<>();

  private final Map<String, Object> configsClientCertificate = new HashMap<>();

  private Map<String, Object> kafkaConfig;

  @Value("${KAFKA_SERVICE_KEY_JSON}")
  private String kafkaServiceKeyJson;

  public final Map<String, Object> getConfigsTrustStore() {
    return configsTrustStore;
  }

  public final Map<String, Object> getConfigsClientCertificate() {
    return configsClientCertificate;
  }

  public final String getCredentialCusterBrokersClientSsl() {
    final Map<?, ?> cluster = (Map<?, ?>) this.kafkaConfig.get("cluster");
    return (String) cluster.get("brokers.client_ssl");
  }

  public final String getCredentialCusterBrokers() {
    final Map<?, ?> cluster = (Map<?, ?>) this.kafkaConfig.get("cluster");
    return (String) cluster.get("brokers");
  }

  @PostConstruct
  private void init() {
    log.info("Kafka Service Key Length: {}", this.kafkaServiceKeyJson.length());
    try {
      this.kafkaConfig = (new ObjectMapper()).readValue(this.kafkaServiceKeyJson, Map.class);
      log.info("Kafka SSL: {}", this.kafkaConfig.get("cluster").toString());
      this.initConfigsClientCertificate();
      this.initConfigsTrustStore();

    } catch (IOException e) {
      log.error("Cannot load kafka config: {}", e);
      throw new RuntimeException(e);
    } catch (GeneralSecurityException e) {
      log.error("Cannot load kafka config: {}", e);
      throw new RuntimeException(e);
    }
  }

  private void initConfigsClientCertificate() throws IOException, GeneralSecurityException {
    final String certificateChain = (String) this.kafkaConfig.get("clientcert");
    final String privateKey = (String) this.kafkaConfig.get("clientkey");

    this.configsClientCertificate.put(SslConfigs.SSL_KEYSTORE_TYPE_CONFIG, DefaultSslEngineFactory.PEM_TYPE);
    this.configsClientCertificate.put(SslConfigs.SSL_KEYSTORE_KEY_CONFIG, new Password(privateKey));
    this.configsClientCertificate.put(SslConfigs.SSL_KEYSTORE_CERTIFICATE_CHAIN_CONFIG, new Password(certificateChain));
  }

  private void initConfigsTrustStore() throws IOException, GeneralSecurityException {
    synchronized (this.configsTrustStore) {
      if (this.configsTrustStore.isEmpty()) {
        final long start = System.currentTimeMillis();

        final Map<?, ?> credentialsUrls = (Map<?, ?>) this.kafkaConfig.get("urls");
        final String certUrl = (String) credentialsUrls.get("certs");
        try (final Scanner scan = new Scanner(new URL(certUrl).openStream(), StandardCharsets.UTF_8.toString())) {
          final Password trustStoreCerts = new Password(scan.useDelimiter("\\A").next());

          this.configsTrustStore.put(SslConfigs.SSL_TRUSTSTORE_TYPE_CONFIG, DefaultSslEngineFactory.PEM_TYPE);
          this.configsTrustStore.put(SslConfigs.SSL_TRUSTSTORE_CERTIFICATES_CONFIG, trustStoreCerts);
        }

        final long time = System.currentTimeMillis() - start;
        log.debug("TrustStore ({}ms)", time);
      }
    }
  }

}
