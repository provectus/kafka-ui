package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MessageSchemaDTO;
import com.provectus.kafka.ui.model.TopicMessageSchemaDTO;
import com.provectus.kafka.ui.newserde.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.newserde.ProducerRecordCreator;
import com.provectus.kafka.ui.newserde.SerdeInstance;
import com.provectus.kafka.ui.newserde.ClusterSerdes;
import com.provectus.kafka.ui.newserde.spi.SchemaDescription;
import com.provectus.kafka.ui.newserde.spi.Serde;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import javax.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DeserializationService {

  private final Map<KafkaCluster, ClusterSerdes> serdes = new ConcurrentHashMap<>();

  @Autowired
  public DeserializationService(Environment env,
                                ClustersStorage clustersStorage,
                                ClustersProperties clustersProperties) {
    for (int i = 0; i < clustersProperties.getClusters().size(); i++) {
      var clusterProperties = clustersProperties.getClusters().get(i);
      var cluster = clustersStorage.getClusterByName(clusterProperties.getName()).get();
      serdes.put(cluster, new ClusterSerdes(env, clustersProperties, i));
    }
  }

  private Optional<SerdeInstance> findSerdeForSchemaRetrieve(KafkaCluster cluster,
                                                             String topic,
                                                             Serde.Type type,
                                                             @Nullable String serdeName) {
    // TODO discuss: depending on future serde use (for ser/deser) different serdes can be found
    // currently we just dont check canSerialize/canDeserialize and just return first serde
    // that matches topic pattern (or default if it is set)
    var serdes = this.serdes.get(cluster);
    if (serdeName != null) {
      var serde = serdes.serdeForName(serdeName)
          .orElseThrow(() -> new ValidationException(String.format("Serde '%s' not found", serdeName)));
      return Optional.of(serde);
    } else {
      return serdes.findSerdeFor(topic, type);
    }
  }

  private Serde.Serializer getSerializer(KafkaCluster cluster,
                                                String topic,
                                                Serde.Type type,
                                                String serdeName) {
    var serdes = this.serdes.get(cluster);
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
                                               Serde.Type type,
                                               @Nullable String serdeName) {
    var serdes = this.serdes.get(cluster);
    if (serdeName != null) {
      var serde = serdes.serdeForName(serdeName)
          .orElseThrow(() -> new ValidationException(String.format("Serde '%s' not found", serdeName)));
      if (!serde.canDeserialize(topic, type)) {
        throw new ValidationException(
            String.format("Serde '%s' can't be applied to '%s' topic %s", serdeName, topic, type));
      }
      return serde;
    } else {
      return serdes.findSerdeForDeserialize(topic, type)
          .orElse(serdes.getFallbackSerde());
    }
  }

  // todo: schemaForTopicForSerialize
  // todo: exlicit enpd with all serdes for topic
  public TopicMessageSchemaDTO schemaForTopic(KafkaCluster cluster,
                                              String topic,
                                              @Nullable String keySerdeName,
                                              @Nullable String valueSerdeName) {
    var maybeKeySerde = findSerdeForSchemaRetrieve(cluster, topic, Serde.Type.KEY, keySerdeName);
    var maybeKeySchemaDescription = maybeKeySerde.flatMap(s -> s.getSchema(topic, Serde.Type.KEY));

    var maybeValueSerde = findSerdeForSchemaRetrieve(cluster, topic, Serde.Type.VALUE, valueSerdeName);
    var maybeValueSchemaDescription = maybeValueSerde.flatMap(s -> s.getSchema(topic, Serde.Type.VALUE));

    return new TopicMessageSchemaDTO()
        .key(
            maybeKeySerde.map(
                serde -> new MessageSchemaDTO()
                    .name(serde.getName())
                    .schema(maybeKeySchemaDescription.map(SchemaDescription::getJsonSchema).orElse(null))
                    .additionalProperties(maybeKeySchemaDescription
                        .map(SchemaDescription::getAdditionalProperties).orElse(null))
            ).orElse(null)
        )
        .value(
            maybeValueSerde.map(
                serde -> new MessageSchemaDTO()
                    .name(serde.getName())
                    .schema(maybeValueSchemaDescription.map(SchemaDescription::getJsonSchema).orElse(null))
                    .additionalProperties(maybeValueSchemaDescription
                        .map(SchemaDescription::getAdditionalProperties).orElse(null))
            ).orElse(null)
        );
  }

  public ProducerRecordCreator producerRecordCreator(KafkaCluster cluster,
                                                     String topic,
                                                     String keySerdeName,
                                                     String valueSerdeName) {
    return new ProducerRecordCreator(
        getSerializer(cluster, topic, Serde.Type.KEY, keySerdeName),
        getSerializer(cluster, topic, Serde.Type.VALUE, valueSerdeName)
    );
  }

  public ConsumerRecordDeserializer deserializerFor(KafkaCluster cluster,
                                                    String topic,
                                                    @Nullable String keySerdeName,
                                                    @Nullable String valueSerdeName) {
    var keySerde = getSerdeForDeserialize(cluster, topic, Serde.Type.KEY, keySerdeName);
    var valueSerde = getSerdeForDeserialize(cluster, topic, Serde.Type.VALUE, valueSerdeName);
    var fallbackSerde = serdes.get(cluster).getFallbackSerde();
    return new ConsumerRecordDeserializer(
        keySerde.getName(),
        keySerde.deserializer(topic, Serde.Type.KEY),
        valueSerde.getName(),
        valueSerde.deserializer(topic, Serde.Type.VALUE),
        fallbackSerde.getName(),
        fallbackSerde.deserializer(topic, Serde.Type.KEY),
        fallbackSerde.deserializer(topic, Serde.Type.VALUE)
    );
  }

  public List<SerdeInstance> getAllSerdes(KafkaCluster cluster) {
    return serdes.get(cluster).asList();
  }

}
