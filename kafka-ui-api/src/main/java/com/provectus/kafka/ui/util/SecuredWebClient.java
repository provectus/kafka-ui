package com.provectus.kafka.ui.util;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.util.ResourceUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

public class SecuredWebClient {
  public static WebClient.Builder configure(
      String keystoreLocation,
      String keystorePassword,
      String truststoreLocation,
      String truststorePassword)
      throws NoSuchAlgorithmException, IOException, KeyStoreException, CertificateException, UnrecoverableKeyException {
    // If we want to customize our TLS configuration, we need at least a truststore
    if (truststoreLocation == null || truststorePassword == null) {
      return WebClient.builder();
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

    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(HttpClient.create().secure(t -> t.sslContext(context))));
  }
}