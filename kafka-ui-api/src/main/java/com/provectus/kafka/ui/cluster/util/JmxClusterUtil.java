package com.provectus.kafka.ui.cluster.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.springframework.stereotype.Component;

import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    private static final List<String> attrNames = Arrays.asList("OneMinuteRate", "FiveMinuteRate", "FifteenMinuteRate");

    public Map<String, Number> getJmxTrafficMetrics(int jmxPort, String jmxHost, String metricName) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        Map<String, Number> result = new HashMap<>();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            ObjectName name = metricName.equals(BYTES_IN_PER_SEC) ? new ObjectName(BYTES_IN_PER_SEC_MBEAN_OBJECT_NAME) :
                    new ObjectName(BYTES_OUT_PER_SEC_MBEAN_OBJECT_NAME);
            for (String attrName : attrNames) {
                Number value = (Number) msc.getAttribute(name, attrName);
                result.put(attrName, value instanceof Double ? BigDecimal.valueOf((Double) value) : Integer.valueOf(value.toString()));
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
        return result;
    }

    private void closeConnectionExceptionally(String url, JMXConnector srv) {
        try {
            pool.invalidateObject(url, srv);
        } catch (Exception e) {
            log.error("Cannot invalidate object in pool, {}", url);
        }
    }
}
