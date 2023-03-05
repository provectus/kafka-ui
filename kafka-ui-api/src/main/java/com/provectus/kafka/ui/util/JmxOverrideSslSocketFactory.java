package com.provectus.kafka.ui.util;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.config.ClustersProperties;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.security.KeyStore;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import lombok.SneakyThrows;
import org.springframework.util.ResourceUtils;

public class JmxOverrideSslSocketFactory extends javax.net.ssl.SSLSocketFactory {

  private final javax.net.ssl.SSLSocketFactory defaultSocketFactory;

  private final static ThreadLocal<Ssl> SSL_CONTEXT_THREAD_LOCAL = new ThreadLocal<>();

  private final static Map<HostAndPort, javax.net.ssl.SSLSocketFactory> CACHED_FACTORIES = new ConcurrentHashMap<>();

  private record HostAndPort(String host, int port) {
  }

  //TODO: unnest fields
  private record Ssl(@Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                     ClustersProperties.KeystoreConfig keystoreConfig) {
  }

  public static void setSslContextThreadLocal(@Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                              ClustersProperties.KeystoreConfig keystoreConfig) {
    SSL_CONTEXT_THREAD_LOCAL.set(new Ssl(truststoreConfig, keystoreConfig));
  }

  public static void clearFactoriesCache() {
    CACHED_FACTORIES.clear();
  }

  public static void clearThreadLocalContext() {
    SSL_CONTEXT_THREAD_LOCAL.set(null);
  }

  @SneakyThrows
  public JmxOverrideSslSocketFactory() {
    this.defaultSocketFactory = SSLContext.getDefault().getSocketFactory();
  }

  @SneakyThrows
  private static javax.net.ssl.SSLSocketFactory createFactoryFromThreadLocal() {

    Ssl ssl = Preconditions.checkNotNull(SSL_CONTEXT_THREAD_LOCAL.get());

    TrustManagerFactory trustManagerFactory =
        TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());

    KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
    trustStore.load(
        new FileInputStream((ResourceUtils.getFile(ssl.truststoreConfig.getTruststoreLocation()))),
        ssl.truststoreConfig().getTruststorePassword().toCharArray()
    );
    trustManagerFactory.init(trustStore);

    KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());

    if (ssl.keystoreConfig().getKeystoreLocation() != null && ssl.keystoreConfig().getKeystorePassword() != null) {
      KeyStore keyStore = KeyStore.getInstance("JKS");
      keyStore.load(
          new FileInputStream(ResourceUtils.getFile(ssl.keystoreConfig.getKeystoreLocation())),
          ssl.keystoreConfig.getKeystorePassword().toCharArray()
      );
      keyManagerFactory.init(keyStore, ssl.keystoreConfig.getKeystorePassword().toCharArray());
    }

    SSLContext ctx = SSLContext.getInstance("TLS");

    ctx.init(
        keyManagerFactory.getKeyManagers(),
        trustManagerFactory.getTrustManagers(),
        null
    );

    return ctx.getSocketFactory();
  }

  @Override
  public Socket createSocket(String host, int port) throws IOException, UnknownHostException {
    var hostAndPort = new HostAndPort(host, port);
    if (containsThreadLocalProperty()) {
      var factory = createFactoryFromThreadLocal();
      CACHED_FACTORIES.put(hostAndPort, factory);
      return factory.createSocket();
    } else if (CACHED_FACTORIES.containsKey(hostAndPort)) {
      return CACHED_FACTORIES.get(hostAndPort).createSocket(host, port);
    }
    return defaultSocketFactory.createSocket(host, port);
  }

  ///------------------------------------------------------------------

  private boolean containsThreadLocalProperty() {
    return SSL_CONTEXT_THREAD_LOCAL.get() != null;
  }

  @Override
  public String[] getDefaultCipherSuites() {
    if (containsThreadLocalProperty()) {
      return createFactoryFromThreadLocal().getDefaultCipherSuites();
    }
    return defaultSocketFactory.getDefaultCipherSuites();
  }

  @Override
  public String[] getSupportedCipherSuites() {
    if (containsThreadLocalProperty()) {
      return createFactoryFromThreadLocal().getSupportedCipherSuites();
    }
    return defaultSocketFactory.getSupportedCipherSuites();
  }

  @Override
  public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
    if (containsThreadLocalProperty()) {
      return createFactoryFromThreadLocal().createSocket(s, host, port, autoClose);
    }
    return defaultSocketFactory.createSocket(s, host, port, autoClose);
  }

  @Override
  public Socket createSocket(String host, int port, InetAddress localHost, int localPort)
      throws IOException, UnknownHostException {
    if (containsThreadLocalProperty()) {
      return createFactoryFromThreadLocal().createSocket(host, port, localHost, localPort);
    }
    return defaultSocketFactory.createSocket(host, port, localHost, localPort);
  }

  @Override
  public Socket createSocket(InetAddress host, int port) throws IOException {
    if (containsThreadLocalProperty()) {
      return createFactoryFromThreadLocal().createSocket(host, port);
    }
    return defaultSocketFactory.createSocket(host, port);
  }

  @Override
  public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
      throws IOException {
    if (containsThreadLocalProperty()) {
      return createFactoryFromThreadLocal().createSocket(address, port, localAddress, localPort);
    }
    return defaultSocketFactory.createSocket(address, port, localAddress, localPort);
  }
}
