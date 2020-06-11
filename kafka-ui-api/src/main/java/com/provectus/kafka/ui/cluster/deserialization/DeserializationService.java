package com.provectus.kafka.ui.cluster.deserialization;

import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;

@Component
@RequiredArgsConstructor
public class DeserializationService {

	private final ClustersStorage clustersStorage;
	private Map<String, RecordDeserializer> clusterDeserializers;

	@PostConstruct
	public void init() {
		this.clusterDeserializers = clustersStorage.getKafkaClusters().stream()
				.collect(Collectors.toMap(
						KafkaCluster::getName,
						this::createRecordDeserializerForCluster
				));
	}

	private RecordDeserializer createRecordDeserializerForCluster(KafkaCluster cluster) {
		if (StringUtils.isEmpty(cluster.getSchemaRegistry())) {
			return new SimpleRecordDeserializer();
		} else {
			return new SchemaRegistryRecordDeserializer(cluster);
		}
	}

	public RecordDeserializer getRecordDeserializerForCluster(KafkaCluster cluster) {
		return clusterDeserializers.get(cluster.getName());
	}
}
