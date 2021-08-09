package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicColumnsToSort;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClusterServiceTest {
  @Spy
  private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);
  @InjectMocks
  private ClusterService clusterService;
  @Mock
  private ClustersStorage clustersStorage;
  @Mock
  private KafkaService kafkaService;

  @Test
  public void shouldListFirst25Topics() {
    var topicName = UUID.randomUUID().toString();

    final KafkaCluster cluster = KafkaCluster.builder()
        .topics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .build()))
        )
        .build();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(cluster));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );

    var topics = clusterService.getTopics(topicName,
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(Topic::getName).isSorted();
  }

  @Test
  public void shouldCalculateCorrectPageCountForNonDivisiblePageSize() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .partitions(Map.of())
                        .name(e)
                        .build()))
            )
            .build()));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );


    var topics = clusterService.getTopics(topicName, Optional.of(4), Optional.of(33),
        Optional.empty(), Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(1)
        .first().extracting(Topic::getName).isEqualTo("99");
  }

  @Test
  public void shouldCorrectlyHandleNonPositivePageNumberAndPageSize() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .partitions(Map.of())
                        .name(e)
                        .build()))
            )
            .build()));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );


    var topics = clusterService.getTopics(topicName, Optional.of(0), Optional.of(-1),
        Optional.empty(), Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(Topic::getName).isSorted();
  }

  @Test
  public void shouldListBotInternalAndNonInternalTopics() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .partitions(Map.of())
                        .name(e)
                        .internal(Integer.parseInt(e) % 10 == 0)
                        .build()))
            )
            .build()));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );


    var topics = clusterService.getTopics(topicName,
        Optional.empty(), Optional.empty(), Optional.of(true),
        Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(Topic::getName).isSorted();
  }


  @Test
  public void shouldListOnlyNonInternalTopics() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .partitions(Map.of())
                        .name(e)
                        .internal(Integer.parseInt(e) % 10 == 0)
                        .build()))
            )
            .build()));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );


    var topics = clusterService.getTopics(topicName,
        Optional.empty(), Optional.empty(), Optional.of(true),
        Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(Topic::getName).isSorted();
  }


  @Test
  public void shouldListOnlyTopicsContainingOne() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .partitions(Map.of())
                        .name(e)
                        .build()))
            )
            .build()));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );


    var topics = clusterService.getTopics(topicName,
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.of("1"), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(1);
    assertThat(topics.getTopics()).hasSize(20);
    assertThat(topics.getTopics()).map(Topic::getName).isSorted();
  }

  @Test
  public void shouldListTopicsOrderedByPartitionsCount() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .partitions(Map.of())
                        .name(e)
                        .partitionCount(100 - Integer.parseInt(e))
                        .build()))
            )
            .build()));

    when(
        kafkaService.getTopicPartitions(any(), any())
    ).thenReturn(
        Map.of()
    );


    var topics = clusterService.getTopics(topicName,
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.of(TopicColumnsToSort.TOTAL_PARTITIONS));
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(Topic::getPartitionCount).isSorted();
  }

  @Test
  public void shouldRetrieveTopicConfigs() {
    var topicName = UUID.randomUUID().toString();

    when(clustersStorage.getClusterByName(topicName))
        .thenReturn(Optional.of(KafkaCluster.builder()
            .topics(
                IntStream.rangeClosed(1, 100).boxed()
                    .map(Objects::toString)
                    .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                        .name(e)
                        .topicConfigs(
                            List.of(InternalTopicConfig.builder()
                                .name("testName")
                                .value("testValue")
                                .defaultValue("testDefaultValue")
                                .source(ConfigEntry.ConfigSource.DEFAULT_CONFIG)
                                .isReadOnly(true)
                                .isSensitive(true)
                                .synonyms(List.of())
                                .build()
                            )
                        )
                        .build()))
            )
            .build()));

    var configs = clusterService.getTopicConfigs(topicName, "1");
    var topicConfig = configs.isPresent() ? configs.get().get(0) : null;

    assertThat(configs.isPresent()).isTrue();
    assertThat(topicConfig.getName()).isEqualTo("testName");
    assertThat(topicConfig.getValue()).isEqualTo("testValue");
    assertThat(topicConfig.getDefaultValue()).isEqualTo("testDefaultValue");
    assertThat(topicConfig.getSource().getValue())
            .isEqualTo(ConfigEntry.ConfigSource.DEFAULT_CONFIG.name());
    assertThat(topicConfig.getSynonyms()).isNotNull();
    assertThat(topicConfig.getIsReadOnly()).isTrue();
    assertThat(topicConfig.getIsSensitive()).isTrue();
  }

}
