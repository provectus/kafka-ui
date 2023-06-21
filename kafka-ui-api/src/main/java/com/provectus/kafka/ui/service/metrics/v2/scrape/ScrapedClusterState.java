package com.provectus.kafka.ui.service.metrics.v2.scrape;

import com.google.common.collect.Table;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.Value;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.TopicDescription;
import reactor.core.publisher.Mono;

@Value
public class ScrapedClusterState {

  record NodeState(SegmentStats segmentStats) {
  }

  record TopicState(
      Instant scrapeTime,
      String name,
      List<ConfigEntry> configs,
      TopicDescription description,
      Map<Integer, Long> offsets,
      SegmentStats segmentStats,
      Map<Integer, SegmentStats> partitionsSegmentStats) {
  }

  record ConsumerGroupState(
      Instant scrapeTime,
      String group,
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
    //TODO impl
    return null;
  }

  public static Mono<ScrapedClusterState> scrape(ReactiveAdminClient ac) {
    return null;//TODO impl
  }

}
