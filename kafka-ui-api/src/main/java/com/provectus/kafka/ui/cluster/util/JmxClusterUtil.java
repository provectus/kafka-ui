package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.kafka.common.Node;
import org.springframework.beans.factory.annotation.Autowired;
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
public class JmxClusterUtil {

    @Autowired
    private KeyedObjectPool pool;

    private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
    private static final String JMX_SERVICE_TYPE = "jmxrmi";

    public static final String BYTES_IN_PER_SEC = "BytesInPerSec";
    public static final String BYTES_OUT_PER_SEC = "BytesOutPerSec";
    private static final String BYTES_IN_PER_SEC_MBEAN_OBJECT_NAME = "kafka.server:type=BrokerTopicMetrics,name=" + BYTES_IN_PER_SEC;
    private static final String BYTES_OUT_PER_SEC_MBEAN_OBJECT_NAME = "kafka.server:type=BrokerTopicMetrics,name=" + BYTES_OUT_PER_SEC;

    private static final List<String> attrNames = Arrays.asList("OneMinuteRate", "FiveMinuteRate", "FifteenMinuteRate");

    public Map<String, BigDecimal> getJmxTrafficMetrics(int jmxPort, String jmxHost, String metricName) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        Map<String, BigDecimal> result = new HashMap<>();
        JMXConnector srv = null;
        try {
            srv = (JMXConnector) pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            ObjectName name = metricName.equals(BYTES_IN_PER_SEC) ? new ObjectName(BYTES_IN_PER_SEC_MBEAN_OBJECT_NAME) :
                    new ObjectName(BYTES_OUT_PER_SEC_MBEAN_OBJECT_NAME);
            for (String attrName : attrNames) {
                result.put(attrName, BigDecimal.valueOf((Double) msc.getAttribute(name, attrName)));
            }
        } catch (MalformedURLException url) {
            log.error("Cannot create JmxServiceUrl from {}", jmxUrl);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (IOException io) {
            log.error("Cannot connect to KafkaJmxServer with url {}", jmxUrl);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (MBeanException | AttributeNotFoundException | InstanceNotFoundException | ReflectionException e) {
            log.error("Cannot find attribute from");
            log.error(e.getMessage());
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (MalformedObjectNameException objectNameE) {
            log.error("Cannot create objectName");
            log.error(objectNameE.getMessage());
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (Exception e) {
            log.error("Error while retrieving connection {} from pool", jmxUrl);
            closeConnectionExceptionally(jmxUrl, srv);
        }
        finally {
            if (srv != null) {
                try {
                    pool.returnObject(jmxUrl, srv);
                } catch (Exception e) {
                    log.error("Cannot return object to poll, {}", jmxUrl);
                }
            }
        }
        return result;
    }

    private void closeConnectionExceptionally(String url, JMXConnector srv) {
        try {
            pool.invalidateObject(url, srv);
            srv.close();
        } catch (IOException ioe) {
            log.error("Cannot close connection with {}", url);
        } catch (Exception e) {
            log.error("Cannot invalidate object in pool, {}", url);
        }
    }


    public void fillJmxPool(Node broker, KafkaCluster cluster) {
        String jmxUrl = JMX_URL + broker.host() + ":" + cluster.getJmxPort() + "/" + JMX_SERVICE_TYPE;
        try {
            pool.addObject(jmxUrl);
        } catch (Exception e) {
            log.error("Cannot connect to {}", jmxUrl);
        }
    }
}
