package com.provectus.kafka.ui.service.integration.odd;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Statistics;
import com.provectus.kafka.ui.service.StatisticsCache;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.opendatadiscovery.client.model.DataEntity;
import org.opendatadiscovery.client.model.DataEntityType;
import org.opendatadiscovery.client.model.DataSet;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.MetadataExtension;
import org.opendatadiscovery.oddrn.model.KafkaPath;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
class TopicsExporter {

  private final Predicate<String> topicFilter;
  private final StatisticsCache statisticsCache;

  @SneakyThrows
  Flux<DataEntity> export(KafkaCluster cluster) {
    Statistics stats = statisticsCache.get(cluster);
    return Flux.fromIterable(stats.getTopicDescriptions().keySet())
        .filter(topicFilter)
        .flatMap(topic -> createTopicDataEntity(cluster, topic, stats));
  }

  @SneakyThrows
  private Mono<DataEntity> createTopicDataEntity(KafkaCluster cluster, String topic, Statistics stats) {
    KafkaPath topicOddrnPath = Oddrn.topicOddrnPath(cluster, topic);
    return Mono.zip(
        getTopicSchema(cluster, topic, topicOddrnPath, true),
        getTopicSchema(cluster, topic, topicOddrnPath, false)
    ).flatMap(keyValueFields -> {

      DataSet dataSet = new DataSet();
      //TODO[discuss]: what should be oddrns for key / value fields?
      Iterables.concat(
          keyValueFields.getT1(),
          keyValueFields.getT2()
      ).forEach(dataSet::addFieldListItem);

      DataEntity topicDE = new DataEntity()
          .name("Topic \"%s\"".formatted(topic)) //TODO[discuss]: discuss naming
          .dataset(dataSet)
          .oddrn(Oddrn.topicOddrn(cluster, topic))
          .type(DataEntityType.KAFKA_TOPIC)
          .addMetadataItem(
              new MetadataExtension()
                  .schemaUrl(URI.create("wontbeused.oops"))
                  .metadata(getTopicMetadata(topic, stats)));

      return Mono.just(topicDE);
    });
  }

  private Map<String, Object> getNonDefaultConfigs(String topic, Statistics stats) {
    List<ConfigEntry> config = stats.getTopicConfigs().get(topic);
    if (config == null) {
      return Map.of();
    }
    return config.stream()
        .filter(c -> c.source() == ConfigEntry.ConfigSource.DYNAMIC_TOPIC_CONFIG)
        .collect(Collectors.toMap(ConfigEntry::name, ConfigEntry::value));
  }

  private Map<String, Object> getTopicMetadata(String topic, Statistics stats) {
    TopicDescription topicDescription = stats.getTopicDescriptions().get(topic);
    return ImmutableMap.<String, Object>builder()
        .put("partitions", topicDescription.partitions().size())
        .put("replication_factor", topicDescription.partitions().get(0).replicas().size())
        .putAll(getNonDefaultConfigs(topic, stats))
        .build();
  }

  private Mono<List<DataSetField>> getTopicSchema(KafkaCluster cluster,
                                                  String topic,
                                                  KafkaPath topicOddrn,
                                                  boolean isKey) {
    if (cluster.getSchemaRegistryClient() == null) {
      return Mono.just(List.of());
    }
    String subject = topic + (isKey ? "-key" : "-value");
    return cluster.getSchemaRegistryClient()
        .mono(client -> client.getSubjectVersion(subject, "latest"))
        .map(subj -> DataSetFieldsExtractor.extract(subj, topicOddrn))
        .onErrorResume(th -> true, th -> Mono.just(List.of()));
  }

}
