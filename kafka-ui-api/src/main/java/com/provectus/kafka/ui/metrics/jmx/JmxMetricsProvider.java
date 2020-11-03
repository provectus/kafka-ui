package com.provectus.kafka.ui.metrics.jmx;

import com.provectus.kafka.ui.cluster.model.InternalClusterMetrics;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.MetricDto;
import com.provectus.kafka.ui.metrics.MetricsProvider;
import com.provectus.kafka.ui.model.Metric;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Component;

import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JmxMetricsProvider implements MetricsProvider {

    private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
    private static final String JMX_SERVICE_TYPE = "jmxrmi";
    private static final String KAFKA_SERVER_PARAM = "kafka.server";
    private static final String NAME_METRIC_FIELD = "name=";
    private static final Pattern CANONICAL_NAME_PATTERN = Pattern.compile(KAFKA_SERVER_PARAM + ":name=([a-zA-Z]+),type=([a-zA-Z]+)");
    // kafka.server:name=ZooKeeperRequestLatencyMs,type=ZooKeeperClientMetrics

    private final KeyedObjectPool<String, JMXConnector> pool;
    private final List<String> jmxMetricsNames;

    public List<Metric> getMetrics(KafkaCluster cluster, Node node) {
        return Optional.of(cluster)
                .filter( c -> c.getJmxPort() != null)
                .filter( c -> c.getJmxPort() > 0)
                .map(c -> getJmxMetrics(c.getJmxPort(), node.host()))
                .orElse(Collections.emptyList());
    }

    @Override
    public boolean configuredForCluster(KafkaCluster cluster) {
        return cluster.getJmxPort() != null && cluster.getJmxPort() > 0;
    }

    private List<Metric> getJmxMetrics(int jmxPort, String jmxHost) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        List<Metric> result = new ArrayList<>();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            var jmxMetrics = msc.queryNames(null, null).stream()
                    .filter(q -> q.getCanonicalName().startsWith(KAFKA_SERVER_PARAM))
                    .collect(Collectors.toList());
            for (ObjectName jmxMetric : jmxMetrics) {
                Metric metric = convertJmxMetricToMetric(jmxMetric, msc);
                result.add(metric);
            }
            pool.returnObject(jmxUrl, srv);
        } catch (IOException ioe) {
            log.error("Cannot get jmxMetricsNames, {}", jmxUrl, ioe);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (MBeanException | AttributeNotFoundException | InstanceNotFoundException | ReflectionException e) {
            log.error("Cannot find attribute", e);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (MalformedObjectNameException objectNameE) {
            log.error("Cannot create objectName", objectNameE);
            closeConnectionExceptionally(jmxUrl, srv);
        } catch (Exception e) {
            log.error("Cannot get JmxConnection from pool, {}", jmxUrl, e);
            closeConnectionExceptionally(jmxUrl, srv);
        }
        return result;
    }

    private Metric convertJmxMetricToMetric(ObjectName jmxMetric, MBeanServerConnection msc) throws MalformedObjectNameException, IntrospectionException, IOException, ReflectionException, AttributeNotFoundException, MBeanException, InstanceNotFoundException {
        Metric metric = new Metric();

        Matcher m = CANONICAL_NAME_PATTERN.matcher(jmxMetric.getCanonicalName());
        if (m.find()) {
            metric.setName(m.group(1));
            metric.setType(m.group(2));
        } else {
            log.error("Can't parse canonical name {}", jmxMetric.getCanonicalName());
        }

        metric.setValue(getJmxMetric(jmxMetric.getCanonicalName(), msc));
        return metric;
    }

    private Map<String, BigDecimal> getJmxMetric(String canonicalName, MBeanServerConnection msc) throws MalformedObjectNameException, IntrospectionException, ReflectionException, InstanceNotFoundException, IOException, AttributeNotFoundException, MBeanException {
        Map<String, BigDecimal> resultAttr = new HashMap<>();
        ObjectName name = new ObjectName(canonicalName);
        var attrNames = msc.getMBeanInfo(name).getAttributes();
        for (MBeanAttributeInfo attrName : attrNames) {
            var value = msc.getAttribute(name, attrName.getName());
            if (value instanceof Number) {
                if (!(value instanceof Double) || !((Double) value).isInfinite())
                resultAttr.put(attrName.getName(), new BigDecimal(value.toString()));
            }
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

    public List<MetricDto> convertToMetricDto(InternalClusterMetrics internalClusterMetrics) {
        return internalClusterMetrics.getInternalBrokerMetrics().values().stream()
                .flatMap(c ->
                        c.getMetrics().stream()
                                .filter(this::isSameMetric)
                                .map(j -> j.getValue().entrySet().stream()
                                        .map(e -> new MetricDto(j.getName(), j.getType(), e.getKey(), e.getValue()))))
                .flatMap(Function.identity())
                .collect(Collectors.toList());
    }

    public Metric convertMetricDtoToMetric(MetricDto metricDto) {
        Metric metric = new Metric();
        metric.setName(metricDto.getName());
        metric.setType(metricDto.getType());
        metric.setValue(Map.of(metricDto.getValueType(), metricDto.getValue()));
        return metric;
    }

    private boolean isSameMetric (Metric metric) {
        // TODO I'm not sure what this method used to do and should do
        return jmxMetricsNames.contains(metric.getName());
    }
}
