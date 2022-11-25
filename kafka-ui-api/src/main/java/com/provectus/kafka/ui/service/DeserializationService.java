package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SerdeDescriptionDTO;
import com.provectus.kafka.ui.serde.api.SchemaDescription;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.ClusterSerdes;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.serdes.ProducerRecordCreator;
import com.provectus.kafka.ui.serdes.SerdeInstance;
import java.io.Closeable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import javax.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DeserializationService implements Closeable {

  private final Map<KafkaCluster, ClusterSerdes> clusterSerdes = new ConcurrentHashMap<>();

  public DeserializationService(Environment env,
                                ClustersStorage clustersStorage,
                                ClustersProperties clustersProperties) {
    for (int i = 0; i < clustersProperties.getClusters().size(); i++) {
      var clusterProperties = clustersProperties.getClusters().get(i);
      var cluster = clustersStorage.getClusterByName(clusterProperties.getName()).get();
      clusterSerdes.put(cluster, new ClusterSerdes(env, clustersProperties, i));
    }
  }

  private Serde.Serializer getSerializer(KafkaCluster cluster,
                                         String topic,
                                         Serde.Target type,
                                         String serdeName) {
    var serdes = this.clusterSerdes.get(cluster);
    var serde = serdes.serdeForName(serdeName)
        .orElseThrow(() -> new ValidationException(
            String.format("Serde %s not found", serdeName)));
    if (!serde.canSerialize(topic, type)) {
      throw new ValidationException(
          String.format("Serde %s can't be applied for '%s' topic's %s serialization", serde, topic, type));
    }
    return serde.serializer(topic, type);
  }

  private SerdeInstance getSerdeForDeserialize(KafkaCluster cluster,
                                               String topic,
                                               Serde.Target type,
                                               @Nullable String serdeName) {
    var serdes = this.clusterSerdes.get(cluster);
    if (serdeName != null) {
      var serde = serdes.serdeForName(serdeName)
          .orElseThrow(() -> new ValidationException(String.format("Serde '%s' not found", serdeName)));
      if (!serde.canDeserialize(topic, type)) {
        throw new ValidationException(
            String.format("Serde '%s' can't be applied to '%s' topic %s", serdeName, topic, type));
      }
      return serde;
    } else {
      return serdes.suggestSerdeForDeserialize(topic, type);
    }
  }

  public ProducerRecordCreator producerRecordCreator(KafkaCluster cluster,
                                                     String topic,
                                                     String keySerdeName,
                                                     String valueSerdeName) {
    return new ProducerRecordCreator(
        getSerializer(cluster, topic, Serde.Target.KEY, keySerdeName),
        getSerializer(cluster, topic, Serde.Target.VALUE, valueSerdeName)
    );
  }

  public ConsumerRecordDeserializer deserializerFor(KafkaCluster cluster,
                                                    String topic,
                                                    @Nullable String keySerdeName,
                                                    @Nullable String valueSerdeName) {
    var keySerde = getSerdeForDeserialize(cluster, topic, Serde.Target.KEY, keySerdeName);
    var valueSerde = getSerdeForDeserialize(cluster, topic, Serde.Target.VALUE, valueSerdeName);
    var fallbackSerde = clusterSerdes.get(cluster).getFallbackSerde();
    return new ConsumerRecordDeserializer(
        keySerde.getName(),
        keySerde.deserializer(topic, Serde.Target.KEY),
        valueSerde.getName(),
        valueSerde.deserializer(topic, Serde.Target.VALUE),
        fallbackSerde.getName(),
        fallbackSerde.deserializer(topic, Serde.Target.KEY),
        fallbackSerde.deserializer(topic, Serde.Target.VALUE)
    );
  }

  public List<SerdeDescriptionDTO> getSerdesForSerialize(KafkaCluster cluster,
                                                         String topic,
                                                         Serde.Target serdeType) {
    var serdes = clusterSerdes.get(cluster);
    var preferred = serdes.suggestSerdeForSerialize(topic, serdeType);
    var result = new ArrayList<SerdeDescriptionDTO>();
    result.add(toDto(preferred, topic, serdeType, true));
    serdes.all()
        .filter(s -> !s.getName().equals(preferred.getName()))
        .filter(s -> s.canSerialize(topic, serdeType))
        .forEach(s -> result.add(toDto(s, topic, serdeType, false)));
    return result;
  }

  public List<SerdeDescriptionDTO> getSerdesForDeserialize(KafkaCluster cluster,
                                                           String topic,
                                                           Serde.Target serdeType) {
    var serdes = clusterSerdes.get(cluster);
    var preferred = serdes.suggestSerdeForDeserialize(topic, serdeType);
    var result = new ArrayList<SerdeDescriptionDTO>();
    result.add(toDto(preferred, topic, serdeType, true));
    serdes.all()
        .filter(s -> !s.getName().equals(preferred.getName()))
        .filter(s -> s.canDeserialize(topic, serdeType))
        .forEach(s -> result.add(toDto(s, topic, serdeType, false)));
    return result;
  }

  private SerdeDescriptionDTO toDto(SerdeInstance serdeInstance,
                                    String topic,
                                    Serde.Target serdeType,
                                    boolean preferred) {
    var schemaOpt = serdeInstance.getSchema(topic, serdeType);
    return new SerdeDescriptionDTO()
        .name(serdeInstance.getName())
        .description(serdeInstance.description().orElse(null))
        .schema(schemaOpt.map(SchemaDescription::getSchema).orElse(null))
        .additionalProperties(schemaOpt.map(SchemaDescription::getAdditionalProperties).orElse(null))
        .preferred(preferred);
  }

  @Override
  public void close() {
    clusterSerdes.values().forEach(ClusterSerdes::close);
  }
}
