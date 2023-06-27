package com.provectus.kafka.ui.service.metrics.v2.scrape;

import static com.provectus.kafka.ui.service.ReactiveAdminClient.*;

import com.google.common.collect.Table;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Value;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.ConsumerGroupState;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import org.apache.kafka.common.requests.DescribeLogDirsResponse.LogDirInfo;
import org.apache.kafka.common.resource.ResourcePatternFilter;
import reactor.core.publisher.Mono;

@Builder
@Value
public class ScrapedClusterState {

  record NodeState(SegmentStats segmentStats) {
  }

  record TopicState(
      Instant scrapeTime,
      String name,
      List<ConfigEntry> configs,
      TopicDescription description,
      Map<Integer, Long> endOffsets,
      SegmentStats segmentStats,
      Map<Integer, SegmentStats> partitionsSegmentStats) {
  }

  record ConsumerGroupState(
      Instant scrapeTime,
      String group,
      org.apache.kafka.common.ConsumerGroupState state,
      ConsumerGroupDescription description,
      Table<String, Integer, Long> committedOffsets,
      Map<String, Instant> lastTopicActivity) {
  }

  record SegmentStats(long segmentSize,
                      int segmentsCount) {
  }

  Instant scrapeStartTime;
  Map<Integer, NodeState> nodesStates;
  Map<String, TopicState> topicStates;
  Map<String, ConsumerGroupState> consumerGroupsStates;

  public static ScrapedClusterState empty() {
    return ScrapedClusterState.builder()
        .scrapeStartTime(Instant.now())
        .nodesStates(Map.of())
        .topicStates(Map.of())
        .consumerGroupsStates(Map.of())
        .build();
  }

  public static Mono<ScrapedClusterState> scrape(ClusterDescription clusterDescription,
                                                 ReactiveAdminClient ac) {

    Mono<InternalLogDirStats> segmentStatsMono = ac.describeLogDirs().map(InternalLogDirStats::new);
    Mono<List<String>> cgListingsMono = ac.listConsumerGroups().map(l -> l.stream().map(ConsumerGroupListing::groupId).toList());
    Mono<Map<String, TopicDescription>> topicDescriptionsMono = ac.describeTopics();
    Mono<Map<String, List<ConfigEntry>>> topicConfigsMono = ac.getTopicsConfig();

    Mono.zip(
        segmentStatsMono,
        cgListingsMono,
        topicDescriptionsMono,
        topicConfigsMono
    ).flatMap(tuple -> {
      InternalLogDirStats segmentStats = tuple.getT1();
      List<String> consumerGroups = tuple.getT2();
      Map<String, TopicDescription> topicDescriptions = tuple.getT3();
      Map<String, List<ConfigEntry>> topicConfigs = tuple.getT4();

      Mono<>
    })

    return null;//TODO impl
  }

}
