package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.model.JmxMetric;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
            jmxMetrics.forEach(j -> {
                JmxMetric metric = new JmxMetric();
                metric.setCanonicalName(j.getCanonicalName());
                metric.setValue(getJmxMetric(jmxPort, jmxHost, j.getCanonicalName()));
                result.add(metric);
            });
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

    private Map<String, BigDecimal> getJmxMetric(int jmxPort, String jmxHost, String canonicalName) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;

        Map<String, BigDecimal> resultAttr = new HashMap<>();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();

            ObjectName name = new ObjectName(canonicalName);
            var attrNames = msc.getMBeanInfo(name).getAttributes();
            for (MBeanAttributeInfo attrName : attrNames) {
                var value = msc.getAttribute(name, attrName.getName());
                if (value instanceof BigDecimal) {
                    resultAttr.put(attrName.getName(), (BigDecimal) value);
                } else if (value instanceof Integer) {
                    resultAttr.put(attrName.getName(), new BigDecimal((Integer) value));
                }
            }
            pool.returnObject(jmxUrl, srv);
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

    public static BigDecimal metricValueReduce(Number value1, Number value2) {
        if (value1 instanceof Integer) {
            return new BigDecimal(value1.toString()).add(new BigDecimal(value2.toString()));
        } else {
            return new BigDecimal(value1.longValue()).add(new BigDecimal(value2.longValue()));
        }
    }
}
