package com.provectus.kafka.ui.metrics;

import java.util.List;

import org.apache.kafka.common.Node;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metric;

public interface MetricsProvider {

	List<Metric> getMetrics(KafkaCluster cluster, Node node);

	boolean configuredForCluster(KafkaCluster cluster);
}
