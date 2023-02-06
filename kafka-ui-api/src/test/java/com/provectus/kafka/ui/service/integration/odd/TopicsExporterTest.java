package com.provectus.kafka.ui.service.integration.odd;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Statistics;
import com.provectus.kafka.ui.service.StatisticsCache;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.sr.model.SchemaSubject;
import com.provectus.kafka.ui.sr.model.SchemaType;
import com.provectus.kafka.ui.util.ReactiveFailover;
import java.util.List;
import java.util.Map;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.client.model.DataEntityType;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class TopicsExporterTest {

  private final KafkaSrClientApi schemaRegistryClientMock = mock(KafkaSrClientApi.class);

  private final KafkaCluster cluster = KafkaCluster.builder()
      .name("testCluster")
      .bootstrapServers("localhost:9092,localhost:19092")
      .schemaRegistryClient(ReactiveFailover.createNoop(schemaRegistryClientMock))
      .build();

  private Statistics stats;

  private TopicsExporter topicsExporter;

  @BeforeEach
  void init() {
    var statisticsCache = mock(StatisticsCache.class);
    when(statisticsCache.get(cluster)).thenAnswer(invocationOnMock -> stats);

    topicsExporter = new TopicsExporter(
        topic -> !topic.startsWith("_"),
        statisticsCache
    );
  }

  @Test
  void doesNotExportTopicsWhichDontFitFiltrationRule() {
    when(schemaRegistryClientMock.getSubjectVersion(anyString(), anyString()))
        .thenReturn(Mono.error(new RuntimeException("Not found")));

    stats = Statistics.empty()
        .toBuilder()
        .topicDescriptions(
            Map.of(
                "_hidden", new TopicDescription("_hidden", false, List.of(
                    new TopicPartitionInfo(0, null, List.of(), List.of())
                )),
                "visible", new TopicDescription("visible", false, List.of(
                    new TopicPartitionInfo(0, null, List.of(), List.of())
                ))
            )
        )
        .build();

    StepVerifier.create(topicsExporter.export(cluster))
        .expectNextMatches(entity -> entity.getOddrn().contains("visible"))
        .verifyComplete();
  }

  @Test
  void doesExportTopicData() {
    when(schemaRegistryClientMock.getSubjectVersion(anyString(), anyString()))
        .thenReturn(Mono.just(
            new SchemaSubject()
                .schema("\"string\"")
                .schemaType(SchemaType.AVRO)
        ));

    stats = Statistics.empty()
        .toBuilder()
        .topicDescriptions(
            Map.of(
                "testTopic",
                new TopicDescription(
                    "testTopic",
                    false,
                    List.of(
                        new TopicPartitionInfo(
                            0,
                            null,
                            List.of(
                                new Node(1, "host1", 9092),
                                new Node(2, "host2", 9092)
                            ),
                            List.of())
                    ))
            )
        )
        .topicConfigs(
            Map.of(
                "testTopic", List.of(
                    new ConfigEntry(
                        "custom.config",
                        "100500",
                        ConfigEntry.ConfigSource.DYNAMIC_TOPIC_CONFIG,
                        false,
                        false,
                        List.of(),
                        ConfigEntry.ConfigType.INT,
                        null
                    )
                )
            )
        )
        .build();

    StepVerifier.create(topicsExporter.export(cluster))
        .assertNext(entity -> {
          assertThat(entity.getName()).isNotEmpty();
          assertThat(entity.getOddrn()).isEqualTo("//kafka/host/localhost:19092,localhost:9092/topics/testTopic");
          assertThat(entity.getType()).isEqualTo(DataEntityType.KAFKA_TOPIC);
          assertThat(entity.getMetadata().get(0).getMetadata())
              .containsExactlyInAnyOrderEntriesOf(
                  Map.of(
                      "partitions", 1,
                      "replication_factor", 2,
                      "custom.config", "100500"
                  )
              );
          assertThat(entity.getDataset()).isNotNull();
          assertThat(entity.getDataset().getFieldList()).hasSize(1);
        })
        .verifyComplete();
  }


}
