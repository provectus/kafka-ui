package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.schemaregistry.SchemaRegistryRecordSerDe;
import com.provectus.kafka.ui.service.ClustersStorage;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeserializationService {

  private final ClustersStorage clustersStorage;
  private final ObjectMapper objectMapper;
  private Map<String, RecordSerDe> clusterDeserializers;


  @PostConstruct
  public void init() {
    this.clusterDeserializers = clustersStorage.getKafkaClusters().stream()
        .collect(Collectors.toMap(
            KafkaCluster::getName,
            this::createRecordDeserializerForCluster
        ));
  }

  private RecordSerDe createRecordDeserializerForCluster(KafkaCluster cluster) {
    try {
      if (cluster.getProtobufFile() != null) {
        return new ProtobufFileRecordSerDe(cluster.getProtobufFile(),
            cluster.getProtobufMessageName(), objectMapper);
      } else {
        return new SchemaRegistryRecordSerDe(cluster, objectMapper);
      }
    } catch (Throwable e) {
      throw new RuntimeException("Can't init deserializer", e);
    }
  }

  public RecordSerDe getRecordDeserializerForCluster(KafkaCluster cluster) {
    return clusterDeserializers.get(cluster.getName());
  }
}
