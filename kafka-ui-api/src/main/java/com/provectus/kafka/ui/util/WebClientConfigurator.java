package com.provectus.kafka.ui.util;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ValidationException;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.util.function.Consumer;
import javax.annotation.Nullable;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import lombok.SneakyThrows;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.http.codec.ClientCodecConfigurer;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.util.ResourceUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

public class WebClientConfigurator {

  private final WebClient.Builder builder = WebClient.builder();
  private HttpClient httpClient = HttpClient
      .create()
      .proxyWithSystemProperties();

  public WebClientConfigurator() {
    configureObjectMapper(defaultOM());
  }

  private static ObjectMapper defaultOM() {
    return new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .registerModule(new JsonNullableModule())
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  }

  public WebClientConfigurator configureSsl(@Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                            @Nullable ClustersProperties.KeystoreConfig keystoreConfig) {
    return configureSsl(
        keystoreConfig != null ? keystoreConfig.getKeystoreLocation() : null,
        keystoreConfig != null ? keystoreConfig.getKeystorePassword() : null,
        truststoreConfig != null ? truststoreConfig.getTruststoreLocation() : null,
        truststoreConfig != null ? truststoreConfig.getTruststorePassword() : null
    );
  }

  @SneakyThrows
  private WebClientConfigurator configureSsl(
      @Nullable String keystoreLocation,
      @Nullable String keystorePassword,
      @Nullable String truststoreLocation,
      @Nullable String truststorePassword) {
    if (truststoreLocation == null && keystoreLocation == null) {
      return this;
    }

    SslContextBuilder contextBuilder = SslContextBuilder.forClient();
    if (truststoreLocation != null && truststorePassword != null) {
      KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
      trustStore.load(
          new FileInputStream((ResourceUtils.getFile(truststoreLocation))),
          truststorePassword.toCharArray()
      );
      TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
          TrustManagerFactory.getDefaultAlgorithm()
      );
      trustManagerFactory.init(trustStore);
      contextBuilder.trustManager(trustManagerFactory);
    }

    // Prepare keystore only if we got a keystore
    if (keystoreLocation != null && keystorePassword != null) {
      KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
      keyStore.load(
          new FileInputStream(ResourceUtils.getFile(keystoreLocation)),
          keystorePassword.toCharArray()
      );

      KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
      keyManagerFactory.init(keyStore, keystorePassword.toCharArray());
      contextBuilder.keyManager(keyManagerFactory);
    }

    // Create webclient
    SslContext context = contextBuilder.build();

    httpClient = httpClient.secure(t -> t.sslContext(context));
    return this;
  }

  public WebClientConfigurator configureBasicAuth(@Nullable String username, @Nullable String password) {
    if (username != null && password != null) {
      builder.defaultHeaders(httpHeaders -> httpHeaders.setBasicAuth(username, password));
    } else if (username != null) {
      throw new ValidationException("You specified username but did not specify password");
    } else if (password != null) {
      throw new ValidationException("You specified password but did not specify username");
    }
    return this;
  }

  public WebClientConfigurator configureBufferSize(DataSize maxBuffSize) {
    builder.codecs(c -> c.defaultCodecs().maxInMemorySize((int) maxBuffSize.toBytes()));
    return this;
  }

  public WebClientConfigurator configureObjectMapper(ObjectMapper mapper) {
    builder.codecs(codecs -> {
      codecs.defaultCodecs()
          .jackson2JsonEncoder(new Jackson2JsonEncoder(mapper, MediaType.APPLICATION_JSON));
      codecs.defaultCodecs()
          .jackson2JsonDecoder(new Jackson2JsonDecoder(mapper, MediaType.APPLICATION_JSON));
    });
    return this;
  }

  public WebClientConfigurator configureCodecs(Consumer<ClientCodecConfigurer> configurer) {
    builder.codecs(configurer);
    return this;
  }

  public WebClient build() {
    return builder.clientConnector(new ReactorClientHttpConnector(httpClient)).build();
  }
}
