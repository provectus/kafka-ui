package com.provectus.kafka.ui.service.integration.odd;

import com.google.common.collect.ImmutableMap;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Statistics;
import com.provectus.kafka.ui.service.StatisticsCache;
import com.provectus.kafka.ui.service.integration.odd.schema.DataSetFieldsExtractors;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.opendatadiscovery.client.model.DataEntity;
import org.opendatadiscovery.client.model.DataEntityList;
import org.opendatadiscovery.client.model.DataEntityType;
import org.opendatadiscovery.client.model.DataSet;
import org.opendatadiscovery.client.model.DataSetField;
import org.opendatadiscovery.client.model.MetadataExtension;
import org.opendatadiscovery.oddrn.model.KafkaPath;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
class TopicsExporter {

  private final Predicate<String> topicFilter;
  private final StatisticsCache statisticsCache;

  Flux<DataEntityList> export(KafkaCluster cluster) {
    String clusterOddrn = Oddrn.clusterOddrn(cluster);
    Statistics stats = statisticsCache.get(cluster);
    return Flux.fromIterable(stats.getTopicDescriptions().keySet())
        .filter(topicFilter)
        .flatMap(topic -> createTopicDataEntity(cluster, topic, stats))
        .buffer(100)
        .map(topicsEntities ->
            new DataEntityList()
                .dataSourceOddrn(clusterOddrn)
                .items(topicsEntities));
  }

  private Mono<DataEntity> createTopicDataEntity(KafkaCluster cluster, String topic, Statistics stats) {
    KafkaPath topicOddrnPath = Oddrn.topicOddrnPath(cluster, topic);
    return
        Mono.zip(
                getTopicSchema(cluster, topic, topicOddrnPath, true),
                getTopicSchema(cluster, topic, topicOddrnPath, false)
            )
            .map(keyValueFields -> {
                  var dataset = new DataSet();
                  keyValueFields.getT1().forEach(dataset::addFieldListItem);
                  keyValueFields.getT2().forEach(dataset::addFieldListItem);
                  return new DataEntity()
                      .name(topic)
                      .description("Kafka topic \"%s\"".formatted(topic))
                      .oddrn(Oddrn.topicOddrn(cluster, topic))
                      .type(DataEntityType.KAFKA_TOPIC)
                      .dataset(dataset)
                      .addMetadataItem(
                          new MetadataExtension()
                              .schemaUrl(URI.create("wontbeused.oops"))
                              .metadata(getTopicMetadata(topic, stats)));
                }
            );
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
                                                  //currently we only retrieve value schema
                                                  boolean isKey) {
    if (cluster.getSchemaRegistryClient() == null) {
      return Mono.just(List.of());
    }
    String subject = topic + (isKey ? "-key" : "-value");
    return cluster.getSchemaRegistryClient()
        .mono(client -> client.getSubjectVersion(subject, "latest"))
        .map(subj -> DataSetFieldsExtractors.extract(subj, topicOddrn, isKey))
        .onErrorResume(WebClientResponseException.NotFound.class, th -> Mono.just(List.of()))
        .onErrorResume(th -> true, th -> {
          log.warn("Error retrieving subject {} for cluster {}", subject, cluster.getName(), th);
          return Mono.just(List.of());
        });
  }

}
