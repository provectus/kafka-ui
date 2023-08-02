package com.provectus.kafka.ui.util;

import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Map;
import java.util.Set;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import org.apache.kafka.common.security.auth.SslEngineFactory;

public class InsecureSslEngineFactory implements SslEngineFactory {

  private SSLContext sslContext;

  @Override
  public SSLEngine createClientSslEngine(String peerHost, int peerPort, String endpointIdentification) {
    var trustManagers =  InsecureTrustManagerFactory.INSTANCE.getTrustManagers();
    try {
      this.sslContext = SSLContext.getInstance("SSL");
      sslContext.init(null, trustManagers, new SecureRandom());
      SSLEngine sslEngine = sslContext.createSSLEngine(peerHost, peerPort);
      sslEngine.setUseClientMode(true);
      return sslEngine;
    } catch (NoSuchAlgorithmException | KeyManagementException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public SSLEngine createServerSslEngine(String peerHost, int peerPort) {
    return null;
  }

  @Override
  public boolean shouldBeRebuilt(Map<String, Object> nextConfigs) {
    return false;
  }

  @Override
  public Set<String> reconfigurableConfigs() {
    return null;
  }

  @Override
  public KeyStore keystore() {
    return null;
  }

  @Override
  public KeyStore truststore() {
    return null;
  }

  @Override
  public void close() {
    this.sslContext = null;
  }

  @Override
  public void configure(Map<String, ?> configs) {

  }
}

