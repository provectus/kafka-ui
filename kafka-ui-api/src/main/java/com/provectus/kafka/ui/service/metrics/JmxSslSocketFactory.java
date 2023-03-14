package com.provectus.kafka.ui.service.metrics;

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

/*
 * Purpose of this class to provide an ability to connect to different JMX endpoints using different keystores.
 *
 * Usually, when you want to establish SSL JMX connection you set "com.sun.jndi.rmi.factory.socket" env
 * property to SslRMIClientSocketFactory instance. SslRMIClientSocketFactory itself uses SSLSocketFactory.getDefault()
 * as a socket factory implementation. Problem here is that when ones SslRMIClientSocketFactory instance is created,
 * the same cached SSLSocketFactory instance will be used to establish connection with *all* JMX endpoints.
 * Moreover, even if we submit custom SslRMIClientSocketFactory implementation which takes specific ssl context
 * into account, SslRMIClientSocketFactory is
 * internally created during RMI calls.
 *
 * So, the only way we found to deal with it is to change internal field ('defaultSocketFactory') of
 * SslRMIClientSocketFactory to our custom impl, and left all internal RMI code work as is.
 * Since RMI code is synchronous, we can pass parameters (which are truststore/keystore) to our custom factory
 * that we want to use when creating ssl socket via ThreadLocal variables.
 *
 * NOTE 1: Theoretically we could avoid using reflection to set internal field set by
 * setting "ssl.SocketFactory.provider" security property (see code in SSLSocketFactory.getDefault()),
 * but that code uses systemClassloader which is not working right when we're creating executable spring boot jar
 * (https://docs.spring.io/spring-boot/docs/current/reference/html/executable-jar.html#appendix.executable-jar.restrictions).
 * We can use this if we swith to other jar-packing solutions in the future.
 *
 * NOTE 2: There are two paths from which socket factory is called - when jmx connection if established (we manage this
 * by passing ThreadLocal vars) and from DGCClient in background thread - we deal with that we cache created factories
 * for specific host+port.
 *
 */
@Slf4j
class JmxSslSocketFactory extends javax.net.ssl.SSLSocketFactory {

  private static final boolean SSL_JMX_SUPPORTED;

  static {
    boolean sslJmxSupported = false;
    try {
      Field defaultSocketFactoryField = SslRMIClientSocketFactory.class.getDeclaredField("defaultSocketFactory");
      defaultSocketFactoryField.setAccessible(true);
      defaultSocketFactoryField.set(null, new JmxSslSocketFactory());
      sslJmxSupported = true;
    } catch (Exception e) {
      log.error("----------------------------------");
      log.error("SSL can't be enabled for JMX retrieval. "
              + "Make sure your java app run with '--add-opens java.rmi/javax.rmi.ssl=ALL-UNNAMED' arg. Err: {}",
          e.getMessage());
      log.trace("SSL can't be enabled for JMX retrieval", e);
      log.error("----------------------------------");
    }
    SSL_JMX_SUPPORTED = sslJmxSupported;
  }

  public static boolean initialized() {
    return SSL_JMX_SUPPORTED;
  }

  private static final ThreadLocal<Ssl> SSL_CONTEXT_THREAD_LOCAL = new ThreadLocal<>();

  private static final Map<HostAndPort, javax.net.ssl.SSLSocketFactory> CACHED_FACTORIES = new ConcurrentHashMap<>();

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

  // should be called when (host:port) -> factory cache should be invalidated (ex. on app config reload)
  public static void clearFactoriesCache() {
    CACHED_FACTORIES.clear();
  }

  public static void clearThreadLocalContext() {
    SSL_CONTEXT_THREAD_LOCAL.set(null);
  }

  public static void editJmxConnectorEnv(Map<String, Object> env) {
    env.put("com.sun.jndi.rmi.factory.socket", new SslRMIClientSocketFactory());
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

  private boolean threadLocalContextSet() {
    return SSL_CONTEXT_THREAD_LOCAL.get() != null;
  }

  @Override
  public Socket createSocket(String host, int port) throws IOException {
    var hostAndPort = new HostAndPort(host, port);
    if (CACHED_FACTORIES.containsKey(hostAndPort)) {
      return CACHED_FACTORIES.get(hostAndPort).createSocket(host, port);
    } else if (threadLocalContextSet()) {
      var factory = createFactoryFromThreadLocalCtx();
      CACHED_FACTORIES.put(hostAndPort, factory);
      return factory.createSocket(host, port);
    }
    return defaultSocketFactory.createSocket(host, port);
  }

  /// FOLLOWING METHODS WON'T BE USED DURING JMX INTERACTION, IMPLEMENTING THEM JUST FOR CONSISTENCY ->>>>>

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
}
