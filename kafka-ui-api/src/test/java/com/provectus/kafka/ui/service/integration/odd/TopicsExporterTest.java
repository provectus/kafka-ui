package com.provectus.kafka.ui.service.integration.odd;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyBoolean;
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
import org.opendatadiscovery.client.model.DataEntity;
import org.opendatadiscovery.client.model.DataEntityType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClientResponseException;
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
    var statisticsCacheMock = mock(StatisticsCache.class);
    when(statisticsCacheMock.get(cluster)).thenAnswer(invocationOnMock -> stats);

    topicsExporter = new TopicsExporter(
        topic -> !topic.startsWith("_"),
        statisticsCacheMock
    );
  }

  @Test
  void doesNotExportTopicsWhichDontFitFiltrationRule() {
    when(schemaRegistryClientMock.getSubjectVersion(anyString(), anyString(), anyBoolean()))
        .thenReturn(Mono.error(WebClientResponseException.create(404, "NF", new HttpHeaders(), null, null, null)));
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
        .assertNext(entityList -> {
          assertThat(entityList.getDataSourceOddrn())
              .isNotEmpty();

          assertThat(entityList.getItems())
              .hasSize(1)
              .allSatisfy(e -> e.getOddrn().contains("visible"));
        })
        .verifyComplete();
  }

  @Test
  void doesExportTopicData() {
    when(schemaRegistryClientMock.getSubjectVersion("testTopic-value", "latest", false))
        .thenReturn(Mono.just(
            new SchemaSubject()
                .schema("\"string\"")
                .schemaType(SchemaType.AVRO)
        ));

    when(schemaRegistryClientMock.getSubjectVersion("testTopic-key", "latest", false))
        .thenReturn(Mono.just(
            new SchemaSubject()
                .schema("\"int\"")
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
        .assertNext(entityList -> {
          assertThat(entityList.getItems())
              .hasSize(1);

          DataEntity topicEntity = entityList.getItems().get(0);
          assertThat(topicEntity.getName()).isNotEmpty();
          assertThat(topicEntity.getOddrn())
              .isEqualTo("//kafka/cluster/localhost:19092,localhost:9092/topics/testTopic");
          assertThat(topicEntity.getType()).isEqualTo(DataEntityType.KAFKA_TOPIC);
          assertThat(topicEntity.getMetadata())
              .hasSize(1)
              .singleElement()
              .satisfies(e ->
                  assertThat(e.getMetadata())
                      .containsExactlyInAnyOrderEntriesOf(
                          Map.of(
                              "partitions", 1,
                              "replication_factor", 2,
                              "custom.config", "100500")));

          assertThat(topicEntity.getDataset()).isNotNull();
          assertThat(topicEntity.getDataset().getFieldList())
              .hasSize(4); // 2 field for key, 2 for value
        })
        .verifyComplete();
  }


}
