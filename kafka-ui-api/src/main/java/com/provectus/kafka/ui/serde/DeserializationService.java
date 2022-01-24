package com.provectus.kafka.ui.serde;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.schemaregistry.SchemaRegistryAwareRecordSerDe;
import com.provectus.kafka.ui.service.ClustersStorage;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
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
        log.info("Using ProtobufFileRecordSerDe for cluster '{}'", cluster.getName());
        return new ProtobufFileRecordSerDe(cluster.getProtobufFile(),
            cluster.getProtobufMessageNameByTopic(), cluster.getProtobufMessageName(),
            objectMapper);
      } else {
        log.info("Using SchemaRegistryAwareRecordSerDe for cluster '{}'", cluster.getName());
        return new SchemaRegistryAwareRecordSerDe(cluster, objectMapper);
      }
    } catch (Throwable e) {
      throw new RuntimeException("Can't init deserializer", e);
    }
  }

  public RecordSerDe getRecordDeserializerForCluster(KafkaCluster cluster) {
    return clusterDeserializers.get(cluster.getName());
  }
}
