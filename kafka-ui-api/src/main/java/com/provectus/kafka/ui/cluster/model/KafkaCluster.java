package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ClusterStatus;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KafkaCluster {

    String name;
    String jmxHost;
    String jmxPort;
    String bootstrapServers;
    String zookeeper;
    ClusterStatus status = ClusterStatus.OFFLINE;

    Map<String, String> metricsMap = new ConcurrentHashMap<>();

    public void putMetric(String metricKey, String metricValue) {
        metricsMap.put(metricKey, metricValue);
    }

    public String getMetric(String metricKey) {
        return metricsMap.get(metricKey);
    }

    public String getMetricsMapAsString() {
        return metricsMap.keySet().stream()
                .map(key -> key + "=" + metricsMap.get(key))
                .collect(Collectors.joining(", ", "{", "}"));
    }
}
