package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.SocketFactory;
import io.netty.handler.ssl.JdkSslContext;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.SslProvider;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.rmi.registry.LocateRegistry;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import javax.management.remote.rmi.RMIConnector;
import javax.management.remote.rmi.RMIJRMPServerImpl;
import javax.management.remote.rmi.RMIServer;
import javax.management.remote.rmi.RMIServerImpl;
import javax.management.remote.rmi.RMIServerImpl_Stub;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import javax.rmi.ssl.SslRMIClientSocketFactory;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.common.Node;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
@Lazy
@Slf4j
class JmxMetricsRetriever implements MetricsRetriever {

  static {
    try {
      Field f = SslRMIClientSocketFactory.class.getDeclaredField("defaultSocketFactory");
      f.setAccessible(true);
      f.set(null, new SocketFactory());
    } catch (NoSuchFieldException | IllegalAccessException e) {
      e.printStackTrace();
    }
  }

  private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
  private static final String JMX_SERVICE_TYPE = "jmxrmi";
  private static final String CANONICAL_NAME_PATTERN = "kafka.server*:*";

  @Override
  public Flux<RawMetric> retrieve(KafkaCluster c, Node node) {
    return Mono.fromSupplier(() -> retrieveSync(c, node))
        .subscribeOn(Schedulers.boundedElastic())
        .flatMapMany(Flux::fromIterable);
  }

  @SneakyThrows
  private List<RawMetric> retrieveSync(KafkaCluster c, Node node) {
    String jmxUrl = JMX_URL + node.host() + ":" + c.getMetricsConfig().getPort() + "/" + JMX_SERVICE_TYPE;
    log.debug("Collection JMX metrics for {}", jmxUrl);
    JMXConnector jmxConnector;
    try {
      jmxConnector = createJmxConnector(jmxUrl, c);
    } catch (Exception e) {
      log.error("Cannot get JMX connector to {} ", jmxUrl, e);
      return Collections.emptyList();
    }
    List<RawMetric> result = new ArrayList<>();
    try {
      MBeanServerConnection msc = jmxConnector.getMBeanServerConnection();
      var jmxMetrics = msc.queryNames(new ObjectName(CANONICAL_NAME_PATTERN), null);
      for (ObjectName jmxMetric : jmxMetrics) {
        result.addAll(extractObjectMetrics(jmxMetric, msc));
      }
    } catch (Exception e) {
      log.error("Error getting jmx metrics from {}", jmxUrl, e);
    } finally {
      jmxConnector.close();
    }
    log.debug("{} metrics collected for {}", result.size(), jmxUrl);
    return result;
  }

  private JMXConnector createJmxConnector(String jmxUrl, KafkaCluster c) throws Exception {
    var config = c.getMetricsConfig();

  }

  @SneakyThrows
  private List<RawMetric> extractObjectMetrics(ObjectName objectName, MBeanServerConnection msc) {
    MBeanAttributeInfo[] attrNames = msc.getMBeanInfo(objectName).getAttributes();
    Object[] attrValues = new Object[attrNames.length];
    for (int i = 0; i < attrNames.length; i++) {
      attrValues[i] = msc.getAttribute(objectName, attrNames[i].getName());
    }
    return JmxMetricsFormatter.constructMetricsList(objectName, attrNames, attrValues);
  }

  //----------------------------------------------------------------------------------------

  private static class OverriddenSslSocketFactory extends SslRMIClientSocketFactory {

    private final SSLContext sslContext;

    @SneakyThrows
    public OverriddenSslSocketFactory(ClustersProperties.Ssl ssl) {
      TrustManagerFactory trustManagerFactory =
          TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());

      if (ssl.getTruststoreLocation() != null && ssl.getTruststorePassword() != null) {
        KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        trustStore.load(
            new FileInputStream((ResourceUtils.getFile(ssl.getTruststoreLocation()))),
            ssl.getTruststorePassword().toCharArray()
        );
        trustManagerFactory.init(trustStore);
      }

      KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());

      if (ssl.getKeystoreLocation() != null && ssl.getKeystorePassword() != null) {
        KeyStore keyStore = KeyStore.getInstance("JKS");
        keyStore.load(
            new FileInputStream(ResourceUtils.getFile(ssl.getKeystoreLocation())),
            ssl.getKeystorePassword().toCharArray()
        );
        keyManagerFactory.init(keyStore, ssl.getKeystorePassword().toCharArray());
      }

      SSLContext ctx = SSLContext.getInstance("TLS");

      log.info("getKeyManagers: " + Arrays.asList(keyManagerFactory.getKeyManagers()));
      log.info("getTrustManagers: " + Arrays.asList(trustManagerFactory.getTrustManagers()));

      ctx.init(
          keyManagerFactory.getKeyManagers(),
          trustManagerFactory.getTrustManagers(),
          null
      );

      this.sslContext = ctx;

//      SslContextBuilder contextBuilder = SslContextBuilder.forClient();
//      contextBuilder.sslProvider(SslProvider.JDK);
//      if (ssl.getTruststoreLocation() != null && ssl.getTruststorePassword() != null) {
//        KeyStore trustStore = KeyStore.getInstance("JKS");
//        trustStore.load(
//            new FileInputStream((ResourceUtils.getFile(ssl.getTruststoreLocation()))),
//            ssl.getTruststorePassword().toCharArray()
//        );
//        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
//            TrustManagerFactory.getDefaultAlgorithm()
//        );
//        trustManagerFactory.init(trustStore);
//        contextBuilder.trustManager(trustManagerFactory);
//      }
//
//      // Prepare keystore only if we got a keystore
//      if (ssl.getKeystoreLocation() != null && ssl.getKeystorePassword() != null) {
//        KeyStore keyStore = KeyStore.getInstance("JKS");
//        keyStore.load(
//            new FileInputStream(ResourceUtils.getFile(ssl.getKeystoreLocation())),
//            ssl.getKeystorePassword().toCharArray()
//        );
//
//        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
//        keyManagerFactory.init(keyStore, ssl.getKeystorePassword().toCharArray());
//        contextBuilder.keyManager(keyManagerFactory);
//      }
//
//      // Create webclient
//      SslContext context = contextBuilder.build();
//      this.sslContext = ((JdkSslContext)context).context();
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException {
      log.info("calling createSocket");
      var s = sslContext.getSocketFactory().createSocket(host, port);
      log.info("socket created");
      return s;
    }
  }

}

