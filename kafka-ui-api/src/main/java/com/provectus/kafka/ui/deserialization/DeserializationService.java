package com.provectus.kafka.ui.deserialization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.model.KafkaCluster;
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
		try {
			if (cluster.getProtobufFile()!=null) {
				return new ProtobufFileRecordDeserializer(cluster.getProtobufFile(), cluster.getProtobufMessageName(), objectMapper);
			} else {
				return new SchemaRegistryRecordDeserializer(cluster, objectMapper);
			}
		} catch (Throwable e) {
			throw new RuntimeException("Can't init deserializer", e);
		}
	}

	public RecordDeserializer getRecordDeserializerForCluster(KafkaCluster cluster) {
		return clusterDeserializers.get(cluster.getName());
	}
}
