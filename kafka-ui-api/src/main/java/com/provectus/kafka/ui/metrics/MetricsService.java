package com.provectus.kafka.ui.metrics;

import lombok.extern.log4j.Log4j2;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metric;

@Log4j2
@Service
public class MetricsService {

	private final Map<String, Optional<MetricsProvider>> providers;

	public MetricsService(List<MetricsProvider> providers, ClustersStorage clustersStorage) {
		this.providers = clustersStorage.getKafkaClusters().stream()
				.collect(Collectors.toMap(
						KafkaCluster::getName,
						c -> providers.stream()
								.filter(p -> p.configuredForCluster(c))
								.findAny()
				));
	}

	public List<Metric> getMetrics(KafkaCluster cluster, Node node) {
		return providers.get(cluster.getName())
				.map(p -> p.getMetrics(cluster, node))
				.orElseGet(() -> {
					log.warn("No metrics providers were found for cluster {}. Check your configuration.", cluster.getName());
					return Collections.emptyList();
				});
	}

	public Metric reduceMetrics (Metric metric1, Metric metric2) {
		var result = new Metric();
		Map<String, BigDecimal> jmx1 = new HashMap<>(metric1.getValue());
		Map<String, BigDecimal> jmx2 = new HashMap<>(metric2.getValue());
		jmx1.forEach((k, v) -> jmx2.merge(k, v, BigDecimal::add));
		result.setName(metric1.getName());
		result.setType(metric1.getType());
		result.setValue(jmx2);
		return result;
	}
}
