package com.provectus.kafka.ui.util;

import com.google.common.base.Preconditions;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.Field;
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
import javax.rmi.ssl.SslRMIClientSocketFactory;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.ResourceUtils;

@Slf4j
public class JmxSslSocketFactory extends javax.net.ssl.SSLSocketFactory {

  private static final boolean SSL_JMX_SUPPORTED;

  static {
    boolean sslJmxSupported = false;
    try {
      Field defaultSocketFactoryField = SslRMIClientSocketFactory.class.getDeclaredField("defaultSocketFactory");
      defaultSocketFactoryField.setAccessible(true);
      defaultSocketFactoryField.set(null, new JmxSslSocketFactory());
      sslJmxSupported = true;
    } catch (NoSuchFieldException | IllegalAccessException e) {
      log.error("----------------------------------");
      log.error("SSL can't be enabled for JMX retrieval", e);
      log.error("----------------------------------");
    }
    SSL_JMX_SUPPORTED = sslJmxSupported;
  }

  public static boolean initialized() {
    return SSL_JMX_SUPPORTED;
  }

  private final static ThreadLocal<Ssl> SSL_CONTEXT_THREAD_LOCAL = new ThreadLocal<>();

  private final static Map<HostAndPort, javax.net.ssl.SSLSocketFactory> CACHED_FACTORIES = new ConcurrentHashMap<>();

  private record HostAndPort(String host, int port) {
  }

  private record Ssl(@Nullable String truststoreLocation,
                     @Nullable String truststorePassword,
                     @Nullable String keystoreLocation,
                     @Nullable String keystorePassword) {
  }

  public static void setSslContextThreadLocal(@Nullable String truststoreLocation,
                                              @Nullable String truststorePassword,
                                              @Nullable String keystoreLocation,
                                              @Nullable String keystorePassword) {
    SSL_CONTEXT_THREAD_LOCAL.set(
        new Ssl(truststoreLocation, truststorePassword, keystoreLocation, keystorePassword));
  }

  public static void clearFactoriesCache() {
    CACHED_FACTORIES.clear();
  }

  public static void clearThreadLocalContext() {
    SSL_CONTEXT_THREAD_LOCAL.set(null);
  }

  //-----------------------------------------------------------------------------------------------

  private final javax.net.ssl.SSLSocketFactory defaultSocketFactory;

  @SneakyThrows
  public JmxSslSocketFactory() {
    this.defaultSocketFactory = SSLContext.getDefault().getSocketFactory();
  }

  @SneakyThrows
  private javax.net.ssl.SSLSocketFactory createFactoryFromThreadLocalCtx() {
    Ssl ssl = Preconditions.checkNotNull(SSL_CONTEXT_THREAD_LOCAL.get());

    var trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    if (ssl.truststoreLocation() != null && ssl.truststorePassword() != null) {
      KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
      trustStore.load(
          new FileInputStream((ResourceUtils.getFile(ssl.truststoreLocation()))),
          ssl.truststorePassword().toCharArray()
      );
      trustManagerFactory.init(trustStore);
    }

    var keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
    if (ssl.keystoreLocation() != null && ssl.keystorePassword() != null) {
      KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
      keyStore.load(
          new FileInputStream(ResourceUtils.getFile(ssl.keystoreLocation())),
          ssl.keystorePassword().toCharArray()
      );
      keyManagerFactory.init(keyStore, ssl.keystorePassword().toCharArray());
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
  public Socket createSocket(String host, int port) throws IOException {
    var hostAndPort = new HostAndPort(host, port);
    if (CACHED_FACTORIES.containsKey(hostAndPort)) {
      return CACHED_FACTORIES.get(hostAndPort).createSocket(host, port);
    } else if (threadLocalContextSet()) {
      var factory = createFactoryFromThreadLocalCtx();
      CACHED_FACTORIES.put(hostAndPort, factory);
      return factory.createSocket();
    }
    return defaultSocketFactory.createSocket(host, port);
  }

  ///------------------------------------------------------------------

  private boolean threadLocalContextSet() {
    return SSL_CONTEXT_THREAD_LOCAL.get() != null;
  }

  @Override
  public String[] getDefaultCipherSuites() {
    if (threadLocalContextSet()) {
      return createFactoryFromThreadLocalCtx().getDefaultCipherSuites();
    }
    return defaultSocketFactory.getDefaultCipherSuites();
  }

  @Override
  public String[] getSupportedCipherSuites() {
    if (threadLocalContextSet()) {
      return createFactoryFromThreadLocalCtx().getSupportedCipherSuites();
    }
    return defaultSocketFactory.getSupportedCipherSuites();
  }

  @Override
  public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
    if (threadLocalContextSet()) {
      return createFactoryFromThreadLocalCtx().createSocket(s, host, port, autoClose);
    }
    return defaultSocketFactory.createSocket(s, host, port, autoClose);
  }

  @Override
  public Socket createSocket(String host, int port, InetAddress localHost, int localPort)
      throws IOException, UnknownHostException {
    if (threadLocalContextSet()) {
      return createFactoryFromThreadLocalCtx().createSocket(host, port, localHost, localPort);
    }
    return defaultSocketFactory.createSocket(host, port, localHost, localPort);
  }

  @Override
  public Socket createSocket(InetAddress host, int port) throws IOException {
    if (threadLocalContextSet()) {
      return createFactoryFromThreadLocalCtx().createSocket(host, port);
    }
    return defaultSocketFactory.createSocket(host, port);
  }

  @Override
  public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
      throws IOException {
    if (threadLocalContextSet()) {
      return createFactoryFromThreadLocalCtx().createSocket(address, port, localAddress, localPort);
    }
    return defaultSocketFactory.createSocket(address, port, localAddress, localPort);
  }
}
