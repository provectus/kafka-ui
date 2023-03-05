package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.config.ClustersProperties.KeystoreConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.JmxOverrideSslSocketFactory;
import java.io.Closeable;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import javax.rmi.ssl.SslRMIClientSocketFactory;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.common.Node;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
@Lazy //TODO: rm
@Slf4j
class JmxMetricsRetriever implements MetricsRetriever, Closeable {

  static {
    try {
      Field f = SslRMIClientSocketFactory.class.getDeclaredField("defaultSocketFactory");
      f.setAccessible(true);
      f.set(null, new JmxOverrideSslSocketFactory());
    } catch (NoSuchFieldException | IllegalAccessException e) {
      e.printStackTrace();
    }
  }

  private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
  private static final String JMX_SERVICE_TYPE = "jmxrmi";
  private static final String CANONICAL_NAME_PATTERN = "kafka.server*:*";

  @Override
  public void close() throws IOException {
    //TODO: add comments
    JmxOverrideSslSocketFactory.clearFactoriesCache();
  }

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
    List<RawMetric> result = new ArrayList<>();
    withJmxConnector(jmxUrl, c, jmxConnector -> getMetricsFromJmx(jmxConnector, result));
    log.debug("{} metrics collected for {}", result.size(), jmxUrl);
    return result;
  }

  @SneakyThrows
  private void getMetricsFromJmx(JMXConnector jmxConnector, List<RawMetric> sink) {
    MBeanServerConnection msc = jmxConnector.getMBeanServerConnection();
    var jmxMetrics = msc.queryNames(new ObjectName(CANONICAL_NAME_PATTERN), null);
    for (ObjectName jmxMetric : jmxMetrics) {
      sink.addAll(extractObjectMetrics(jmxMetric, msc));
    }
  }

  //TODO: wrap with closeable / consumer passing
  private void withJmxConnector(String jmxUrl,
                                KafkaCluster c,
                                Consumer<JMXConnector> consumer) {
    var env = prepareJmxEnvAndSetThreadLocal(c);
    try {
      JMXConnector connector = null;
      try {
        connector = JMXConnectorFactory.connect(new JMXServiceURL(jmxUrl), env);
      } catch (Exception exception) {
        log.error("Error connecting to {}", jmxUrl, exception);
        return;
      }
      consumer.accept(connector);
      connector.close();
    } catch (Exception e) {
      log.error("Error getting jmx metrics from {}", jmxUrl, e);
    } finally {
      JmxOverrideSslSocketFactory.clearThreadLocalContext();
    }
  }

  private Map<String, Object> prepareJmxEnvAndSetThreadLocal(KafkaCluster c) {
    var metricsConfig = c.getMetricsConfig();
    Map<String, Object> env = new HashMap<>();
    if (metricsConfig.getKeystoreLocation() != null) {
      //TODO nulls check
      JmxOverrideSslSocketFactory.setSslContextThreadLocal(
          c.getOriginalProperties().getSsl(),
          new KeystoreConfig(metricsConfig.getKeystoreLocation(), metricsConfig.getKeystorePassword())
      );
      env.put("com.sun.jndi.rmi.factory.socket", new SslRMIClientSocketFactory());
    }

    if (StringUtils.isNotEmpty(metricsConfig.getUsername())
        && StringUtils.isNotEmpty(metricsConfig.getPassword())) {
      env.put(
          "jmx.remote.credentials",
          new String[] {metricsConfig.getUsername(), metricsConfig.getPassword()}
      );
    }
    return env;
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

}

