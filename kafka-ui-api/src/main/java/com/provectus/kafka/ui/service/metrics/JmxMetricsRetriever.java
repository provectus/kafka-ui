package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.model.JmxConnectionInfo;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.JmxPoolFactory;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPoolConfig;
import org.apache.kafka.common.Node;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
@Lazy
@Slf4j
class JmxMetricsRetriever implements MetricsRetriever, AutoCloseable {

  private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
  private static final String JMX_SERVICE_TYPE = "jmxrmi";
  private static final String CANONICAL_NAME_PATTERN = "kafka.server*:*";

  private final GenericKeyedObjectPool<JmxConnectionInfo, JMXConnector> pool;

  public JmxMetricsRetriever() {
    this.pool = new GenericKeyedObjectPool<>(new JmxPoolFactory());
    GenericKeyedObjectPoolConfig<JMXConnector> poolConfig = new GenericKeyedObjectPoolConfig<>();
    poolConfig.setMaxIdlePerKey(3);
    poolConfig.setMaxTotalPerKey(3);
    this.pool.setConfig(poolConfig);
  }

  @Override
  public Flux<RawMetric> retrieve(KafkaCluster c, Node node) {
    return Mono.fromSupplier(() -> retrieveSync(c, node))
        .subscribeOn(Schedulers.boundedElastic())
        .flatMapMany(Flux::fromIterable);
  }

  private List<RawMetric> retrieveSync(KafkaCluster c, Node node) {
    String jmxUrl = JMX_URL + node.host() + ":" + c.getMetricsConfig().getPort() + "/" + JMX_SERVICE_TYPE;
    log.debug("Collection JMX metrics for {}", jmxUrl);
    final var connectionInfo = JmxConnectionInfo.builder()
        .url(jmxUrl)
        .ssl(c.getMetricsConfig().isSsl())
        .username(c.getMetricsConfig().getUsername())
        .password(c.getMetricsConfig().getPassword())
        .build();
    JMXConnector srv;
    try {
      srv = pool.borrowObject(connectionInfo);
    } catch (Exception e) {
      log.error("Cannot get JMX connector for the pool due to: ", e);
      return Collections.emptyList();
    }
    List<RawMetric> result = new ArrayList<>();
    try {
      MBeanServerConnection msc = srv.getMBeanServerConnection();
      var jmxMetrics = msc.queryNames(new ObjectName(CANONICAL_NAME_PATTERN), null);
      for (ObjectName jmxMetric : jmxMetrics) {
        result.addAll(extractObjectMetrics(jmxMetric, msc));
      }
      pool.returnObject(connectionInfo, srv);
    } catch (Exception e) {
      log.error("Cannot get jmxMetricsNames, {}", jmxUrl, e);
      closeConnectionExceptionally(jmxUrl, srv);
    }
    log.debug("{} metrics collected for {}", result.size(), jmxUrl);
    return result;
  }

  private void closeConnectionExceptionally(String url, JMXConnector srv) {
    try {
      pool.invalidateObject(new JmxConnectionInfo(url), srv);
    } catch (Exception e) {
      log.error("Cannot invalidate object in pool, {}", url, e);
    }
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

  @Override
  public void close() {
    this.pool.close();
  }
}

