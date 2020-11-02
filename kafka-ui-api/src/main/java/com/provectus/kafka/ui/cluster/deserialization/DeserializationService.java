package com.provectus.kafka.ui.cluster.deserialization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DeserializationService {

	private final ClustersStorage clustersStorage;
	private final ObjectMapper objectMapper;
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
		return new SchemaRegistryRecordDeserializer(cluster, objectMapper);
	}

	public RecordDeserializer getRecordDeserializerForCluster(KafkaCluster cluster) {
		return clusterDeserializers.get(cluster.getName());
	}
}
