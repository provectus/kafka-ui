package com.provectus.kafka.ui.metrics.prometheus;

import lombok.Value;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ExtendedAdminClient;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaAdminClientStore;
import com.provectus.kafka.ui.metrics.MetricsProvider;
import com.provectus.kafka.ui.model.Metric;

@Service
public class PrometheusMetricProvider implements MetricsProvider {

	private static final String URL_TEMPLATE = "http://%s:%s/%s";

	private final KafkaAdminClientStore adminClientStore;
	private final ClusterMapper clusterMapper;
	private final PrometheusMetricParser metricParser;

	// TODO get rid of optional here
	private Map<ClientKey, Optional<PrometheusMetricClient>> clients;

	public PrometheusMetricProvider(ClustersProperties clustersProperties,
									KafkaAdminClientStore adminClientStore,
									ClusterMapper clusterMapper,
									PrometheusMetricParser metricParser) {
		this.adminClientStore = adminClientStore;
		this.clusterMapper = clusterMapper;
		this.metricParser = metricParser;

		initClients(clustersProperties);
	}

	public List<Metric> getMetrics(KafkaCluster cluster, Node node) {
		PrometheusMetricClient metricClient = clients.get(buildKey(cluster, node)).get();
		// TODO don't block here.
		return metricClient.getMetrics().block();
	}

	@Override
	public boolean configuredForCluster(KafkaCluster cluster) {
		return cluster.getPrometheusPort() != null ||
				cluster.getPrometheusExporters() != null && !cluster.getPrometheusExporters().isEmpty();
	}

	private void initClients(ClustersProperties clustersProperties) {
		clustersProperties.getClusters().stream()
				.map(clusterMapper::toKafkaCluster)
				.forEach(this::initClusterClients);
	}

	private void initClusterClients(KafkaCluster cluster) {
		this.clients = adminClientStore.getOrCreateAdminClient(cluster)
				.map(ExtendedAdminClient::getAdminClient)
				.map(ac -> ac.describeCluster().nodes())
				.flatMap(ClusterUtil::toMono)
				.flatMapIterable(Function.identity())
				.collectMap(
						node -> buildKey(cluster, node),
						node -> buildClient(cluster, node)
				)
				.block();
	}

	private Optional<PrometheusMetricClient> buildClient(KafkaCluster cluster, Node node) {
		return buildPrometheusEndpointUrl(cluster, node)
				.map(url -> WebClient.builder()
						.baseUrl(url)
						.exchangeStrategies(
								ExchangeStrategies.builder()
										.codecs(configurer -> configurer
												.defaultCodecs()
												.maxInMemorySize(1024 * 1024))
										.build()
						)
						.build()
				)
				.map(webClient -> new PrometheusMetricClient(webClient, metricParser));
	}

	private Optional<String> buildPrometheusEndpointUrl(KafkaCluster cluster, Node node) {
		return Optional.ofNullable(cluster.getPrometheusExporters())
				.orElse(Collections.emptyList())
				.stream()
				.filter(c -> c.getBrokerId().equals(node.idString()))
				.findAny()
				.map(c -> String.format(URL_TEMPLATE, c.getHost(), c.getPort(), c.getContext()))
				.or(() ->
						Optional.ofNullable(cluster.getPrometheusPort())
								.map(p -> String.format(URL_TEMPLATE, node.host(), p, "metrics"))
				);
	}

	private ClientKey buildKey(KafkaCluster cluster, Node node) {
		return new ClientKey(cluster.getName(), node.idString());
	}

	@Value
	private static class ClientKey {
		String clusterName;
		String brokerId;
	}
}
