package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.model.TopicColumnsToSortDTO;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.TopicPartitionInfo;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class TopicsServicePaginationTest {

  private TopicsService.Pagination pagination;

  private void init(Collection<TopicDescription> topicsInCache) {
    ReactiveAdminClient adminClient = when(mock(ReactiveAdminClient.class).listTopics(true))
        .thenReturn(Mono.just(topicsInCache.stream().map(TopicDescription::name)
            .collect(Collectors.toSet())))
        .getMock();

    MetricsCache.Metrics metricsCache = MetricsCache.empty().toBuilder()
        .topicDescriptions(
            topicsInCache.stream().collect(Collectors.toMap(TopicDescription::name, d -> d)))
        .build();

    pagination = new TopicsService.Pagination(adminClient, metricsCache);
  }

  @Test
  public void shouldListFirst25Topics() {
    init(
        IntStream.rangeClosed(1, 100).boxed()
            .map(Objects::toString)
            .map(name -> new TopicDescription(name, false, List.of()))
            .collect(Collectors.toList())
    );

    var topics = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.empty(), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).isSorted();
  }

  @Test
  public void shouldListFirst25TopicsSortedByNameDescendingOrder() {
    var topicDescriptions = IntStream.rangeClosed(1, 100).boxed()
        .map(Objects::toString)
        .map(name -> new TopicDescription(name, false, List.of()))
        .collect(Collectors.toList());
    init(topicDescriptions);

    var topics = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.of(TopicColumnsToSortDTO.NAME), Optional.of(SortOrderDTO.DESC)).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).isSortedAccordingTo(Comparator.reverseOrder());
    assertThat(topics.getTopics()).containsExactlyElementsOf(
        topicDescriptions.stream()
            .map(TopicDescription::name)
            .sorted(Comparator.reverseOrder())
            .limit(25)
            .collect(Collectors.toList())
    );
  }

  @Test
  public void shouldCalculateCorrectPageCountForNonDivisiblePageSize() {
    init(
        IntStream.rangeClosed(1, 100).boxed()
            .map(Objects::toString)
            .map(name -> new TopicDescription(name, false, List.of()))
            .collect(Collectors.toList())
    );

    var topics = pagination.getPage(Optional.of(4), Optional.of(33),
        Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(1)
        .first().isEqualTo("99");
  }

  @Test
  public void shouldCorrectlyHandleNonPositivePageNumberAndPageSize() {
    init(
        IntStream.rangeClosed(1, 100).boxed()
            .map(Objects::toString)
            .map(name -> new TopicDescription(name, false, List.of()))
            .collect(Collectors.toList())
    );

    var topics = pagination.getPage(Optional.of(0), Optional.of(-1),
        Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).isSorted();
  }

  @Test
  public void shouldListBotInternalAndNonInternalTopics() {
    init(
        IntStream.rangeClosed(1, 100).boxed()
            .map(Objects::toString)
            .map(name -> new TopicDescription(name, Integer.parseInt(name) % 10 == 0, List.of()))
            .collect(Collectors.toList())
    );

    var topics = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.of(true),
        Optional.empty(), Optional.empty(), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).isSorted();
  }


  @Test
  public void shouldListOnlyNonInternalTopics() {
    init(
        IntStream.rangeClosed(1, 100).boxed()
            .map(Objects::toString)
            .map(name -> new TopicDescription(name, false, List.of()))
            .collect(Collectors.toList())
    );

    var topics = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.of(true),
        Optional.empty(), Optional.empty(), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).isSorted();
  }


  @Test
  public void shouldListOnlyTopicsContainingOne() {
    init(
        IntStream.rangeClosed(1, 100).boxed()
            .map(Objects::toString)
            .map(name -> new TopicDescription(name, false, List.of()))
            .collect(Collectors.toList())
    );

    var topics = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.of("1"), Optional.empty(), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(1);
    assertThat(topics.getTopics()).hasSize(20);
    assertThat(topics.getTopics()).isSorted();
  }

  @Test
  public void shouldListTopicsOrderedByPartitionsCount() {
    List<TopicDescription> topicDescriptions = IntStream.rangeClosed(1, 100).boxed()
        .map(i -> new TopicDescription(UUID.randomUUID().toString(), false,
            IntStream.range(0, i)
                .mapToObj(p ->
                    new TopicPartitionInfo(p, null, List.of(), List.of()))
                .collect(Collectors.toList())))
        .collect(Collectors.toList());

    init(topicDescriptions);

    var topics = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.of(TopicColumnsToSortDTO.TOTAL_PARTITIONS), Optional.empty()).block();
    assertThat(topics.getTotalPages()).isEqualTo(4);
    assertThat(topics.getTopics()).hasSize(25);
    assertThat(topics.getTopics()).containsExactlyElementsOf(
        topicDescriptions.stream()
            .map(TopicDescription::name)
            .limit(25)
            .collect(Collectors.toList()));

    var topicsSortedDesc = pagination.getPage(
        Optional.empty(), Optional.empty(), Optional.empty(),
        Optional.empty(), Optional.of(TopicColumnsToSortDTO.TOTAL_PARTITIONS), Optional.of(SortOrderDTO.DESC)).block();
    assertThat(topicsSortedDesc.getTotalPages()).isEqualTo(4);
    assertThat(topicsSortedDesc.getTopics()).hasSize(25);
    assertThat(topicsSortedDesc.getTopics()).containsExactlyElementsOf(
        topicDescriptions.stream()
            .sorted((a, b) -> b.partitions().size() - a.partitions().size())
            .map(TopicDescription::name)
            .limit(25)
            .collect(Collectors.toList()));
  }

}
