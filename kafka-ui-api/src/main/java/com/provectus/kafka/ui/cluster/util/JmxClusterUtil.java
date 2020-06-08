package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.commons.pool2.impl.GenericKeyedObjectPool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class JmxClusterUtil {

    @Autowired
    private ClustersStorage clustersStorage;

    private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
    private static final String JMX_SERVICE_TYPE = "jmxrmi";

    public static final String BYTES_IN_PER_SEC = "BytesInPerSec";
    public static final String BYTES_OUT_PER_SEC = "BytesOutPerSec";
    private static final String BYTES_IN_PER_SEC_MBEAN_OBJECT_NAME = "kafka.server:type=BrokerTopicMetrics,name=" + BYTES_IN_PER_SEC;
    private static final String BYTES_OUT_PER_SEC_MBEAN_OBJECT_NAME = "kafka.server:type=BrokerTopicMetrics,name=" + BYTES_OUT_PER_SEC;

    private static final List<String> attrNames = Arrays.asList("OneMinuteRate", "FiveMinuteRate", "FifteenMinuteRate");

    private static KeyedObjectPool pool = new GenericKeyedObjectPool(new JmxPoolFactory());

    public static Map<String, String> getJmxTrafficMetrics(int jmxPort, String jmxHost, String metricName) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        Map<String, String> result = new HashMap<>();
        JMXConnector srv = null;
        try {
            srv = (JMXConnector) pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            ObjectName name = metricName.equals(BYTES_IN_PER_SEC) ? new ObjectName(BYTES_IN_PER_SEC_MBEAN_OBJECT_NAME) :
                    new ObjectName(BYTES_OUT_PER_SEC_MBEAN_OBJECT_NAME);
            for (String attrName : attrNames) {
                result.put(attrName, msc.getAttribute(name, attrName).toString());
            }
        } catch (MalformedURLException url) {
            log.error("Cannot create JmxServiceUrl from {}", jmxUrl);
        } catch (IOException io) {
            log.error("Cannot connect to KafkaJmxServer with url {}", jmxUrl);
        } catch (MBeanException | AttributeNotFoundException | InstanceNotFoundException | ReflectionException e) {
            log.error("Cannot find attribute from");
            log.error(e.getMessage());
        } catch (MalformedObjectNameException objectNameE) {
            log.error("Cannot create objectName");
            log.error(objectNameE.getMessage());
        } catch (Exception e) {
            log.error("Error while retrieving connection {} from pool", jmxUrl);
            try {
                pool.invalidateObject(jmxUrl, srv);
            } catch (Exception ie) {
                log.error("Cannot invalidate object to pool, {}", jmxUrl);
            }
        }
        finally {
            if (srv != null) {
                try {
                    pool.returnObject(jmxUrl, srv);
                } catch (Exception e) {
                    log.error("Cannot returl object to poll, {}", jmxUrl);
                }
            }
        }
        return result;
    }

    @PostConstruct
    public void fillJmxPool() {
        clustersStorage.getKafkaClusters().stream().forEach(c -> {
            String jmxUrl = JMX_URL + c.getJmxHost() + ":" + c.getJmxPort() + "/" + JMX_SERVICE_TYPE;
            try {
                pool.addObject(jmxUrl);
            } catch (Exception e) {
                log.error("Cannot connect to {}", jmxUrl);
            }
        });
    }
}
