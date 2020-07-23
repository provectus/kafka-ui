package com.provectus.kafka.ui.cluster.util;

import com.google.common.collect.ImmutableList;
import com.provectus.kafka.ui.cluster.model.InternalClusterMetrics;
import com.provectus.kafka.ui.cluster.model.MetricDto;
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
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JmxClusterUtil {

    private final KeyedObjectPool<String, JMXConnector> pool;

    private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
    private static final String JMX_SERVICE_TYPE = "jmxrmi";
    private static final String KAFKA_SERVER_PARAM = "kafka.server";


    private static final ImmutableList<String> metricsNames = ImmutableList.of(
        "MessagesInPerSec", "BytesInPerSec", "ReplicationBytesInPerSec", "RequestsPerSec", "ErrorsPerSec", "MessageConversionsPerSec", "BytesOutPerSec", "ReplicationBytesOutPerSec", "NoKeyCompactedTopicRecordsPerSec",
        "InvalidMagicNumberRecordsPerSec", "InvalidMessageCrcRecordsPerSec", "InvalidOffsetOrSequenceRecordsPerSec",
        "UncleanLeaderElectionsPerSec", "IsrShrinksPerSec", "IsrExpandsPerSec", "ReassignmentBytesOutPerSec", "ReassignmentBytesInPerSec",
        "ProduceMessageConversionsPerSec", "FailedFetchRequestsPerSec", "ZooKeeperSyncConnectsPerSec", "BytesRejectedPerSec",
        "IsrShrinksPerSec", "ReplicationBytesOutPerSec", "ZooKeeperAuthFailuresPerSec", "TotalFetchRequestsPerSec", "FailedIsrUpdatesPerSec",
        "IncrementalFetchSessionEvictionsPerSec", "FetchMessageConversionsPerSec", "TotalFetchRequestsPerSec", "FailedProduceRequestsPerSec"
    );

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
                    if (!(value instanceof Double) || !((Double) value).isInfinite())
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

    public static List<MetricDto> squashIntoNameMetricPair(InternalClusterMetrics internalClusterMetrics) {
        return internalClusterMetrics.getInternalBrokerMetrics().values().stream()
                .map(c ->
                        c.getJmxMetrics().stream()
                                .filter(j -> isSameMetric(j.getCanonicalName()))
                                .map(j -> j.getValue().entrySet().stream()
                                        .map(e -> new MetricDto(j.getCanonicalName(), e.getKey(), e.getValue()))))
                .flatMap(Function.identity()).flatMap(Function.identity()).collect(Collectors.toList());
    }

    public static JmxMetric reduceJmxMetrics (JmxMetric metric1, JmxMetric metric2) {
        var result = new JmxMetric();
        Map<String, BigDecimal> jmx1 = new HashMap<>(metric1.getValue());
        Map<String, BigDecimal> jmx2 = new HashMap<>(metric2.getValue());
        jmx1.forEach((k, v) -> jmx2.merge(k, v, BigDecimal::add));
        result.setCanonicalName(metric1.getCanonicalName());
        result.setValue(jmx2);
        return result;
    }

    private static boolean isSameMetric (String metric) {
        if (metric.contains("name=")) {
            int beginIndex = metric.indexOf("name=");
            int endIndex = metric.indexOf(',', beginIndex);
            endIndex = endIndex < 0 ? metric.length() - 1 : endIndex;
            return metricsNames.contains(metric.substring(beginIndex + 5, endIndex));
        } else {
            return false;
        }
    }
}
