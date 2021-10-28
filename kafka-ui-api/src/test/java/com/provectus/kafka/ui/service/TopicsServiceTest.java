package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.InternalClusterMetrics;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.TopicColumnsToSortDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.serde.DeserializationService;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
class TopicsServiceTest {
  @Spy
  private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);
  @InjectMocks
  private TopicsService topicsService;
  @Mock
  private AdminClientService adminClientService;
  @Mock
  private ConsumerGroupService consumerGroupService;
  @Mock
  private ClustersStorage clustersStorage;

  @Mock
  private DeserializationService deserializationService;

  @Test
  public void shouldListFirst25Topics() {
    final KafkaCluster cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .build()))
        );

    var topics = topicsService.getTopics(cluster,
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(TopicDTO::getName).isSorted();
  }

  @Test
  public void shouldCalculateCorrectPageCountForNonDivisiblePageSize() {
    var cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .build()))
        );

    var topics = topicsService.getTopics(cluster, Optional.of(4), Optional.of(33),
        Optional.empty(), Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(1)
        .first().extracting(TopicDTO::getName).isEqualTo("99");
  }

  @Test
  public void shouldCorrectlyHandleNonPositivePageNumberAndPageSize() {
    var cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .build()))
        );

    var topics = topicsService.getTopics(cluster, Optional.of(0), Optional.of(-1),
        Optional.empty(), Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(TopicDTO::getName).isSorted();
  }

  @Test
  public void shouldListBotInternalAndNonInternalTopics() {
    var cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .internal(Integer.parseInt(e) % 10 == 0)
                    .build()))
        );

    var topics = topicsService.getTopics(cluster,
        Optional.empty(), Optional.empty(), Optional.of(true),
        Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(TopicDTO::getName).isSorted();
  }


  @Test
  public void shouldListOnlyNonInternalTopics() {
    var cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .internal(Integer.parseInt(e) % 10 == 0)
                    .build()))
        );

    var topics = topicsService.getTopics(cluster,
        Optional.empty(), Optional.empty(), Optional.of(true),
        Optional.empty(), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(TopicDTO::getName).isSorted();
  }


  @Test
  public void shouldListOnlyTopicsContainingOne() {
    var cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .build()))
        );

    var topics = topicsService.getTopics(cluster,
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.of("1"), Optional.empty());
    assertThat(topics.getPageCount()).isEqualTo(1);
    assertThat(topics.getTopics()).hasSize(20);
    assertThat(topics.getTopics()).map(TopicDTO::getName).isSorted();
  }

  @Test
  public void shouldListTopicsOrderedByPartitionsCount() {
    var cluster = clusterWithTopics(
            IntStream.rangeClosed(1, 100).boxed()
                .map(Objects::toString)
                .collect(Collectors.toMap(Function.identity(), e -> InternalTopic.builder()
                    .partitions(Map.of())
                    .name(e)
                    .partitionCount(100 - Integer.parseInt(e))
                    .build()))
        );

    var topics = topicsService.getTopics(cluster,
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.of(TopicColumnsToSortDTO.TOTAL_PARTITIONS));
    assertThat(topics.getPageCount()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).map(TopicDTO::getPartitionCount).isSorted();
  }

  @Test
  public void shouldRetrieveTopicConfigs() {
    var cluster = clusterWithTopics(
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
        );

    var topicConfigs = topicsService.getTopicConfigs(cluster, "1");
    assertThat(topicConfigs).hasSize(1);

    var topicConfig = topicConfigs.get(0);
    assertThat(topicConfig.getName()).isEqualTo("testName");
    assertThat(topicConfig.getValue()).isEqualTo("testValue");
    assertThat(topicConfig.getDefaultValue()).isEqualTo("testDefaultValue");
    assertThat(topicConfig.getSource().getValue())
            .isEqualTo(ConfigEntry.ConfigSource.DEFAULT_CONFIG.name());
    assertThat(topicConfig.getSynonyms()).isNotNull();
    assertThat(topicConfig.getIsReadOnly()).isTrue();
    assertThat(topicConfig.getIsSensitive()).isTrue();
  }

  private KafkaCluster clusterWithTopics(Map<String, InternalTopic> topics) {
    return KafkaCluster.builder()
        .metrics(InternalClusterMetrics.builder()
            .topics(topics)
            .build())
        .build();
  }

}
