package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.InternalJmxMetric;
import com.provectus.kafka.ui.model.JmxMetric;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.springframework.stereotype.Component;

import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.IOException;
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

    public static final String BYTES_IN_PER_SEC = "BytesInPerSec";
    public static final String BYTES_OUT_PER_SEC = "BytesOutPerSec";
    private static final String BYTES_IN_PER_SEC_MBEAN_OBJECT_NAME = "kafka.server:type=BrokerTopicMetrics,name=" + BYTES_IN_PER_SEC;
    private static final String BYTES_OUT_PER_SEC_MBEAN_OBJECT_NAME = "kafka.server:type=BrokerTopicMetrics,name=" + BYTES_OUT_PER_SEC;

    public List<InternalJmxMetric> getJmxMetricsNames(int jmxPort, String jmxHost) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        List<InternalJmxMetric> result = new ArrayList<>();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            var jmxMetrics = msc.queryNames(null, null).stream().filter(q -> q.getCanonicalName().startsWith("kafka.server")).collect(Collectors.toList());
            jmxMetrics.forEach(j -> {
                InternalJmxMetric.InternalJmxMetricBuilder internalMetric = InternalJmxMetric.builder();
                internalMetric.name(j.getKeyPropertyList().computeIfAbsent("name", s -> null));
                internalMetric.topic(j.getKeyPropertyList().computeIfAbsent("topic", s -> null));
                internalMetric.type(j.getKeyPropertyList().computeIfAbsent("type", s -> null));
                internalMetric.canonicalName(j.getCanonicalName());
                result.add(internalMetric.build());
            });
        } catch (IOException ioe) {
            log.error("Cannot get jmxMetricsNames, {}", jmxUrl, ioe);
        } catch (Exception e) {
            log.error("Cannot get JmxConnection from pool, {}", jmxUrl, e);
        }
        return result;
    }

    public JmxMetric getJmxMetric(int jmxPort, String jmxHost, String canonicalName) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;

        var result = new JmxMetric();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            Map<String, Object> resultAttr = new HashMap<>();
            ObjectName name = new ObjectName(canonicalName);
            var attrNames = msc.getMBeanInfo(name).getAttributes();
            for (MBeanAttributeInfo attrName : attrNames) {
                resultAttr.put(attrName.getName(), msc.getAttribute(name, attrName.getName()));
            }
            result.setCanonicalName(canonicalName);
            result.setValue(resultAttr);
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
        return result;
    }

    private void closeConnectionExceptionally(String url, JMXConnector srv) {
        try {
            pool.invalidateObject(url, srv);
        } catch (Exception e) {
            log.error("Cannot invalidate object in pool, {}", url);
        }
    }

    public String getParamFromName(String param, String name) {
        int paramValueBeginIndex = name.indexOf(param) + param.length() + 1;
        int paramValueEndIndex = name.indexOf(',', paramValueBeginIndex);
        return paramValueEndIndex != -1 ? name.substring(paramValueBeginIndex, paramValueEndIndex) : name.substring(paramValueBeginIndex);
    }
}
