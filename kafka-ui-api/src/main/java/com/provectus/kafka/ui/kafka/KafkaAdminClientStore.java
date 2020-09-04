package com.provectus.kafka.ui.kafka;

import reactor.core.publisher.Mono;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.config.ConfigResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.provectus.kafka.ui.cluster.model.ExtendedAdminClient;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;

@Service
@RequiredArgsConstructor
@Log4j2
public class KafkaAdminClientStore {

	private static final String CLUSTER_VERSION_PARAM_KEY = "inter.broker.protocol.version";

	@Value("${kafka.admin-client-timeout}")
	private int clientTimeout;

	private final Map<String, ExtendedAdminClient> adminClientCache = new ConcurrentHashMap<>();

	@SneakyThrows
	public Mono<ExtendedAdminClient> getOrCreateAdminClient(KafkaCluster cluster) {
		return Mono.justOrEmpty(adminClientCache.get(cluster.getName()))
				.switchIfEmpty(createAdminClient(cluster))
				.map(e -> adminClientCache.computeIfAbsent(cluster.getName(), key -> e));
	}

	public Mono<ExtendedAdminClient> createAdminClient(KafkaCluster kafkaCluster) {
		Properties properties = new Properties();
		properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCluster.getBootstrapServers());
		properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, clientTimeout);
		AdminClient adminClient = AdminClient.create(properties);
		return extendedAdminClient(adminClient);
	}

	private Mono<ExtendedAdminClient> extendedAdminClient(AdminClient adminClient) {
		return getSupportedFeatures(adminClient)
				.map(s -> new ExtendedAdminClient(adminClient, s));
	}

	private Mono<Set<ExtendedAdminClient.SupportedFeature>> getSupportedFeatures(AdminClient adminClient) {
		return ClusterUtil.toMono(adminClient.describeCluster().controller())
				.map(Node::id)
				.map(id -> Collections.singletonList(new ConfigResource(ConfigResource.Type.BROKER, id.toString())))
				.map(brokerCR -> adminClient.describeConfigs(brokerCR).all())
				.flatMap(ClusterUtil::toMono)
				.map(this::getSupportedUpdateFeature)
				.map(Collections::singleton);
	}

	private ExtendedAdminClient.SupportedFeature getSupportedUpdateFeature(Map<ConfigResource, Config> configs) {
		float kafkaVersion = getKafkaVersion(configs);
		return kafkaVersion <= 2.3f
				? ExtendedAdminClient.SupportedFeature.ALTER_CONFIGS
				: ExtendedAdminClient.SupportedFeature.INCREMENTAL_ALTER_CONFIGS;
	}

	private float getKafkaVersion(Map<ConfigResource, Config> configs) {
		String version = configs.values().stream()
				.map(Config::entries)
				.flatMap(Collection::stream)
				.filter(entry -> entry.name().contains(CLUSTER_VERSION_PARAM_KEY))
				.findFirst().orElseThrow().value();
		try {
			final String[] parts = version.split("\\.");
			if (parts.length > 2) {
				version = parts[0] + "." + parts[1];
			}
			return Float.parseFloat(version.split("-")[0]);
		} catch (Exception e) {
			log.error("Conversion clusterVersion {} to float value failed", version);
			throw e;
		}
	}
}
