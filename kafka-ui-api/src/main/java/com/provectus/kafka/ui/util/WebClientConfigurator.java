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

  public WebClientConfigurator() {
    configureObjectMapper(defaultOM());
  }

  private static ObjectMapper defaultOM() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    JsonNullableModule jnm = new JsonNullableModule();
    mapper.registerModule(jnm);
    return mapper;
  }


  public WebClientConfigurator configureSsl(@Nullable ClustersProperties.WebClientSsl ssl) {
    if (ssl != null) {
      return configureSsl(
          ssl.getKeystoreLocation(),
          ssl.getKeystorePassword(),
          ssl.getTruststoreLocation(),
          ssl.getTruststorePassword()
      );
    }
    return this;
  }

  @SneakyThrows
  public WebClientConfigurator configureSsl(
      @Nullable String keystoreLocation,
      @Nullable String keystorePassword,
      @Nullable String truststoreLocation,
      @Nullable String truststorePassword) {
    // If we want to customize our TLS configuration, we need at least a truststore
    if (truststoreLocation == null || truststorePassword == null) {
      return this;
    }

    SslContextBuilder contextBuilder = SslContextBuilder.forClient();

    // Prepare truststore
    KeyStore trustStore = KeyStore.getInstance("JKS");
    trustStore.load(
        new FileInputStream((ResourceUtils.getFile(truststoreLocation))),
        truststorePassword.toCharArray()
    );

    TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
        TrustManagerFactory.getDefaultAlgorithm()
    );
    trustManagerFactory.init(trustStore);
    contextBuilder.trustManager(trustManagerFactory);

    // Prepare keystore only if we got a keystore
    if (keystoreLocation != null && keystorePassword != null) {
      KeyStore keyStore = KeyStore.getInstance("JKS");
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

    builder.clientConnector(new ReactorClientHttpConnector(HttpClient.create().secure(t -> t.sslContext(context))));
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
    return builder.build();
  }
}
