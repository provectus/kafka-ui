package com.provectus.kafka.ui.service.metrics.scrape;

import static com.provectus.kafka.ui.model.InternalLogDirStats.LogDirSpaceStats;
import static com.provectus.kafka.ui.model.InternalLogDirStats.SegmentStats;
import static com.provectus.kafka.ui.service.ReactiveAdminClient.ClusterDescription;

import com.google.common.collect.Table;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.InternalPartitionsOffsets;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import jakarta.annotation.Nullable;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import reactor.core.publisher.Mono;

@Builder(toBuilder = true)
@RequiredArgsConstructor
@Value
public class ScrapedClusterState {

  Instant scrapeFinishedAt;
  Map<Integer, NodeState> nodesStates;
  Map<String, TopicState> topicStates;
  Map<String, ConsumerGroupState> consumerGroupsStates;

  public record NodeState(int id,
                          Node node,
                          @Nullable SegmentStats segmentStats,
                          @Nullable LogDirSpaceStats logDirSpaceStats) {
  }

  public record TopicState(
      String name,
      TopicDescription description,
      List<ConfigEntry> configs,
      Map<Integer, Long> startOffsets,
      Map<Integer, Long> endOffsets,
      @Nullable SegmentStats segmentStats,
      @Nullable Map<Integer, SegmentStats> partitionsSegmentStats) {
  }

  public record ConsumerGroupState(
      String group,
      ConsumerGroupDescription description,
      Map<TopicPartition, Long> committedOffsets) {
  }

  public static ScrapedClusterState empty() {
    return ScrapedClusterState.builder()
        .scrapeFinishedAt(Instant.now())
        .nodesStates(Map.of())
        .topicStates(Map.of())
        .consumerGroupsStates(Map.of())
        .build();
  }

  public ScrapedClusterState updateTopics(Map<String, TopicDescription> descriptions,
                                          Map<String, List<ConfigEntry>> configs,
                                          InternalPartitionsOffsets partitionsOffsets) {
    var updatedTopicStates = new HashMap<>(topicStates);
    descriptions.forEach((topic, description) -> {
      SegmentStats segmentStats = null;
      Map<Integer, SegmentStats> partitionsSegmentStats = null;
      if (topicStates.containsKey(topic)) {
        segmentStats = topicStates.get(topic).segmentStats();
        partitionsSegmentStats = topicStates.get(topic).partitionsSegmentStats();
      }
      updatedTopicStates.put(
          topic,
          new TopicState(
              topic,
              description,
              configs.getOrDefault(topic, List.of()),
              partitionsOffsets.topicOffsets(topic, true),
              partitionsOffsets.topicOffsets(topic, false),
              segmentStats,
              partitionsSegmentStats
          )
      );
    });
    return toBuilder()
        .topicStates(updatedTopicStates)
        .build();
  }

  public ScrapedClusterState topicDeleted(String topic) {
    var newTopicStates = new HashMap<>(topicStates);
    newTopicStates.remove(topic);
    return toBuilder()
        .topicStates(newTopicStates)
        .build();
  }

  public static Mono<ScrapedClusterState> scrape(ClusterDescription clusterDescription,
                                                 ReactiveAdminClient ac) {
    return Mono.zip(
        ac.describeLogDirs(clusterDescription.getNodes().stream().map(Node::id).toList())
            .map(InternalLogDirStats::new),
        ac.listConsumerGroups().map(l -> l.stream().map(ConsumerGroupListing::groupId).toList()),
        ac.describeTopics(),
        ac.getTopicsConfig()
    ).flatMap(phase1 ->
        Mono.zip(
            ac.listOffsets(phase1.getT3().values(), OffsetSpec.latest()),
            ac.listOffsets(phase1.getT3().values(), OffsetSpec.earliest()),
            ac.describeConsumerGroups(phase1.getT2()),
            ac.listConsumerGroupOffsets(phase1.getT2(), null)
        ).map(phase2 ->
            create(
                clusterDescription,
                phase1.getT1(),
                phase1.getT3(),
                phase1.getT4(),
                phase2.getT1(),
                phase2.getT2(),
                phase2.getT3(),
                phase2.getT4()
            )));
  }

  private static ScrapedClusterState create(ClusterDescription clusterDescription,
                                            InternalLogDirStats segmentStats,
                                            Map<String, TopicDescription> topicDescriptions,
                                            Map<String, List<ConfigEntry>> topicConfigs,
                                            Map<TopicPartition, Long> latestOffsets,
                                            Map<TopicPartition, Long> earliestOffsets,
                                            Map<String, ConsumerGroupDescription> consumerDescriptions,
                                            Table<String, TopicPartition, Long> consumerOffsets) {


    Map<String, TopicState> topicStates = new HashMap<>();
    topicDescriptions.forEach((name, desc) ->
        topicStates.put(
            name,
            new TopicState(
                name,
                desc,
                topicConfigs.getOrDefault(name, List.of()),
                filterTopic(name, earliestOffsets),
                filterTopic(name, latestOffsets),
                segmentStats.getTopicStats().get(name),
                Optional.ofNullable(segmentStats.getPartitionsStats())
                    .map(topicForFilter -> filterTopic(name, topicForFilter))
                    .orElse(null)
            )));

    Map<String, ConsumerGroupState> consumerGroupsStates = new HashMap<>();
    consumerDescriptions.forEach((name, desc) ->
        consumerGroupsStates.put(
            name,
            new ConsumerGroupState(
                name,
                desc,
                consumerOffsets.row(name)
            )));

    Map<Integer, NodeState> nodesStates = new HashMap<>();
    clusterDescription.getNodes().forEach(node ->
        nodesStates.put(
            node.id(),
            new NodeState(
                node.id(),
                node,
                segmentStats.getBrokerStats().get(node.id()),
                segmentStats.getBrokerDirsStats().get(node.id())
            )));

    return new ScrapedClusterState(
        Instant.now(),
        nodesStates,
        topicStates,
        consumerGroupsStates
    );
  }

  private static <T> Map<Integer, T> filterTopic(String topicForFilter, Map<TopicPartition, T> tpMap) {
    return tpMap.entrySet()
        .stream()
        .filter(tp -> tp.getKey().topic().equals(topicForFilter))
        .collect(Collectors.toMap(e -> e.getKey().partition(), Map.Entry::getValue));
  }


}
