package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.JmxMetric;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.pool2.KeyedObjectPool;
import org.springframework.stereotype.Component;

import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JmxClusterUtil {

    private final KeyedObjectPool<String, JMXConnector> pool;

    private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
    private static final String JMX_SERVICE_TYPE = "jmxrmi";
    private static final String KAFKA_SERVER_PARAM = "kafka.server";

    public List<JmxMetric> getJmxMetrics(int jmxPort, String jmxHost) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        List<JmxMetric> result = new ArrayList<>();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            var jmxMetrics = msc.queryNames(null, null).stream().filter(q -> q.getCanonicalName().startsWith(KAFKA_SERVER_PARAM)).collect(Collectors.toList());
            for (ObjectName jmxMetric : jmxMetrics) {
                JmxMetric metric = new JmxMetric();
                metric.setCanonicalName(jmxMetric.getCanonicalName());
                metric.setValue(getJmxMetric(jmxMetric.getCanonicalName(), msc, srv, jmxUrl));
                result.add(metric);
            };
            pool.returnObject(jmxUrl, srv);
        } catch (IOException ioe) {
            log.error("Cannot get jmxMetricsNames, {}", jmxUrl, ioe);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (Exception e) {
            log.error("Cannot get JmxConnection from pool, {}", jmxUrl, e);
            closeConnectionExceptionally(jmxUrl, srv);
        }
        return result;
    }

    private Map<String, BigDecimal> getJmxMetric(String canonicalName, MBeanServerConnection msc, JMXConnector srv, String jmxUrl) {
        Map<String, BigDecimal> resultAttr = new HashMap<>();
        try {
            ObjectName name = new ObjectName(canonicalName);
            var attrNames = msc.getMBeanInfo(name).getAttributes();
            for (MBeanAttributeInfo attrName : attrNames) {
                var value = msc.getAttribute(name, attrName.getName());
                if (value instanceof Number) {
                    resultAttr.put(attrName.getName(), new BigDecimal(value.toString()));
                }
            }
        } catch (MalformedURLException url) {
            log.error("Cannot create JmxServiceUrl from {}", jmxUrl);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (IOException io) {
            log.error("Cannot connect to KafkaJmxServer with url {}", jmxUrl);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (MBeanException | AttributeNotFoundException | InstanceNotFoundException | ReflectionException e) {
            log.error("Cannot find attribute", e);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (MalformedObjectNameException objectNameE) {
            log.error("Cannot create objectName", objectNameE);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (Exception e) {
            log.error("Error while retrieving connection {} from pool", jmxUrl);
            closeConnectionExceptionally(jmxUrl, srv);
        }
        return resultAttr;
    }

    private void closeConnectionExceptionally(String url, JMXConnector srv) {
        try {
            pool.invalidateObject(url, srv);
        } catch (Exception e) {
            log.error("Cannot invalidate object in pool, {}", url);
        }
    }

    private static Pair<String, String> getCanonicalAndMetricName(String value) {
        return Pair.of(value.substring(0, value.indexOf("+")), value.substring(value.indexOf("+") + 1));
    }

    public static List<Pair<String, Pair<String, BigDecimal>>> squashIntoNameMetricPair(InternalClusterMetrics internalClusterMetrics) {
        return internalClusterMetrics.getInternalBrokerMetrics().values().stream()
                .map(c ->
                        c.getJmxMetrics().stream()
                                .filter(j -> StringUtils.containsIgnoreCase(j.getCanonicalName(), "num") || StringUtils.containsIgnoreCase(j.getCanonicalName(), "persec"))
                                .map(j -> j.getValue().entrySet().stream()
                                        .map(e -> Pair.of(j.getCanonicalName() + "+" + e.getKey(), e.getValue()))
                                        .collect(Collectors.toList()))
                                .collect(Collectors.toList())
                )
                .collect(Collectors.toList())
                .stream().flatMap(List::stream).collect(Collectors.toList())
                .stream().flatMap(List::stream).collect(Collectors.toList())
                .stream().map(c -> {
            var pairNames = JmxClusterUtil.getCanonicalAndMetricName(c.getKey());
            return Pair.of(pairNames.getKey(), Pair.of(pairNames.getValue(), c.getValue()));
        }).collect(Collectors.toList());
    }

    public static JmxMetric reduceJmxMetrics (List<JmxMetric> metrics) {
        var result = List.copyOf(metrics);
        return result.stream().reduce((j1, j2) -> {
            var temp1 = new HashMap<>(j1.getValue());
            var temp2 = new HashMap<>(j2.getValue());
            temp2.forEach((k, v) -> temp1.merge(k, v, BigDecimal::add));
            var mergedMetric = new JmxMetric();
            mergedMetric.setCanonicalName(j1.getCanonicalName());
            mergedMetric.setValue(temp1);
            return mergedMetric;
        }).orElse(null);
    }
}
