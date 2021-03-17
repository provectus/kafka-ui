package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.Metric;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.KeyedObjectPool;
import org.springframework.stereotype.Component;

import javax.management.*;
import javax.management.remote.JMXConnector;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@Slf4j
@RequiredArgsConstructor
public class JmxClusterUtil {

    private final KeyedObjectPool<String, JMXConnector> pool;

    private static final String JMX_URL = "service:jmx:rmi:///jndi/rmi://";
    private static final String JMX_SERVICE_TYPE = "jmxrmi";
    private static final String KAFKA_SERVER_PARAM = "kafka.server";
    private static final String NAME_METRIC_FIELD = "name";

    public List<Metric> getJmxMetrics(int jmxPort, String jmxHost) {
        String jmxUrl = JMX_URL + jmxHost + ":" + jmxPort + "/" + JMX_SERVICE_TYPE;
        List<Metric> result = new ArrayList<>();
        JMXConnector srv = null;
        try {
            srv = pool.borrowObject(jmxUrl);
            MBeanServerConnection msc = srv.getMBeanServerConnection();
            var jmxMetrics = msc.queryNames(null, null).stream().filter(q -> q.getCanonicalName().startsWith(KAFKA_SERVER_PARAM)).collect(Collectors.toList());
            for (ObjectName jmxMetric : jmxMetrics) {
                final Hashtable<String, String> params = jmxMetric.getKeyPropertyList();
                Metric metric = new Metric();
                metric.setName(params.get(NAME_METRIC_FIELD));
                metric.setCanonicalName(jmxMetric.getCanonicalName());
                metric.setParams(params);
                metric.setValue(getJmxMetric(jmxMetric.getCanonicalName(), msc, srv, jmxUrl));
                result.add(metric);
            }
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

    public Metric reduceJmxMetrics (Metric metric1, Metric metric2) {
        var result = new Metric();
        Map<String, BigDecimal> value = Stream.concat(
                metric1.getValue().entrySet().stream(),
                metric2.getValue().entrySet().stream()
        ).collect(Collectors.groupingBy(
                Map.Entry::getKey,
                Collectors.reducing(BigDecimal.ZERO, Map.Entry::getValue, BigDecimal::add)
        ));
        result.setName(metric1.getName());
        result.setCanonicalName(metric1.getCanonicalName());
        result.setParams(metric1.getParams());
        result.setValue(value);
        return result;
    }

    private boolean isWellKnownMetric(Metric metric) {
        final Optional<String> param = Optional.ofNullable(metric.getParams().get(NAME_METRIC_FIELD)).filter(p ->
                Arrays.stream(JmxMetricsName.values()).map(Enum::name)
                        .anyMatch(n -> n.equals(p))
        );
        return metric.getCanonicalName().contains(KAFKA_SERVER_PARAM) && param.isPresent();
    }
}
