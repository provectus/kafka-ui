package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.JmxConnectionInfo;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.management.MBeanAttributeInfo;
import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.kafka.common.Node;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class JmxMetricsRetriever implements MetricsRetriever {

  private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
  private static final String JMX_SERVICE_TYPE = "jmxrmi";
  private static final String KAFKA_SERVER_PARAM = "kafka.server";
  private static final String NAME_METRIC_FIELD = "name";

  @Autowired
  private final KeyedObjectPool<JmxConnectionInfo, JMXConnector> pool;


  @Override
  @SneakyThrows
  public List<MetricDTO> retrieve(KafkaCluster c, Node node) {
    String jmxUrl = JMX_URL + node.host() + ":" + c.getMetrics().getPort() + "/" + JMX_SERVICE_TYPE;
    final var connectionInfo = JmxConnectionInfo.builder()
        .url(jmxUrl)
        .ssl(c.getMetrics().isSslEnabled())
        .username(c.getMetrics().getUsername())
        .password(c.getMetrics().getPassword())
        .build();
    JMXConnector srv;
    try {
      srv = pool.borrowObject(connectionInfo);
    } catch (Exception e) {
      log.error("Cannot get JMX connector for the pool due to: ", e);
      return Collections.emptyList();
    }

    List<MetricDTO> result = new ArrayList<>();
    try {
      MBeanServerConnection msc = srv.getMBeanServerConnection();
      var jmxMetrics = msc.queryNames(null, null).stream()
          .filter(q -> q.getCanonicalName().startsWith(KAFKA_SERVER_PARAM))
          .collect(Collectors.toList());
      for (ObjectName jmxMetric : jmxMetrics) {
        final Hashtable<String, String> params = jmxMetric.getKeyPropertyList();
        MetricDTO metric = new MetricDTO();
        metric.setName(params.get(NAME_METRIC_FIELD));
        metric.setCanonicalName(jmxMetric.getCanonicalName());
        metric.setParams(params);
        metric.setValue(getJmxMetrics(jmxMetric.getCanonicalName(), msc));
        result.add(metric);
      }
      pool.returnObject(connectionInfo, srv);
    } catch (Exception e) {
      log.error("Cannot get jmxMetricsNames, {}", jmxUrl, e);
      closeConnectionExceptionally(jmxUrl, srv);
    }
    return result;
  }

  private void closeConnectionExceptionally(String url, JMXConnector srv) {
    try {
      pool.invalidateObject(new JmxConnectionInfo(url), srv);
    } catch (Exception e) {
      log.error("Cannot invalidate object in pool, {}", url);
    }
  }

  @SneakyThrows
  private Map<String, BigDecimal> getJmxMetrics(String canonicalName, MBeanServerConnection msc) {
    Map<String, BigDecimal> resultAttr = new HashMap<>();
    ObjectName name = new ObjectName(canonicalName);
    var attrNames = msc.getMBeanInfo(name).getAttributes();
    for (MBeanAttributeInfo attrName : attrNames) {
      var value = msc.getAttribute(name, attrName.getName());
      if (NumberUtil.isNumeric(value)) {
        resultAttr.put(attrName.getName(), new BigDecimal(value.toString()));
      }
    }
    return resultAttr;
  }
}
