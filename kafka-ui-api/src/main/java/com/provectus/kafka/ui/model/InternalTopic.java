package com.provectus.kafka.ui.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.TopicPartition;

@Data
@Builder(toBuilder = true)
public class InternalTopic {

  // from TopicDescription
  private final String name;
  private final boolean internal;
  private final int replicas;
  private final int partitionCount;
  private final int inSyncReplicas;
  private final int replicationFactor;
  private final int underReplicatedPartitions;
  private final Map<Integer, InternalPartition> partitions;

  // topic configs
  private final List<InternalTopicConfig> topicConfigs;
  private final CleanupPolicy cleanUpPolicy;

  // rates from metrics
  private final BigDecimal bytesInPerSec;
  private final BigDecimal bytesOutPerSec;

  // from log dir data
  private final long segmentSize;
  private final long segmentCount;

  public static InternalTopic from(TopicDescription topicDescription,
                                   List<ConfigEntry> configs,
                                   InternalPartitionsOffsets partitionsOffsets,
                                   Metrics metrics,
                                   InternalLogDirStats logDirInfo) {
    var topic = InternalTopic.builder();
    topic.internal(topicDescription.isInternal());
    topic.name(topicDescription.name());

    List<InternalPartition> partitions = topicDescription.partitions().stream()
        .map(partition -> {
          var partitionDto = InternalPartition.builder();

          partitionDto.leader(partition.leader() != null ? partition.leader().id() : null);
          partitionDto.partition(partition.partition());
          partitionDto.inSyncReplicasCount(partition.isr().size());
          partitionDto.replicasCount(partition.replicas().size());
          List<InternalReplica> replicas = partition.replicas().stream()
              .map(r ->
                  InternalReplica.builder()
                    .broker(r.id())
                    .inSync(partition.isr().contains(r))
                    .leader(partition.leader() != null && partition.leader().id() == r.id())
                    .build())
              .collect(Collectors.toList());
          partitionDto.replicas(replicas);

          partitionsOffsets.get(topicDescription.name(), partition.partition())
              .ifPresent(offsets -> {
                partitionDto.offsetMin(offsets.getEarliest());
                partitionDto.offsetMax(offsets.getLatest());
              });

          var segmentStats =
              logDirInfo.getPartitionsStats().get(
                  new TopicPartition(topicDescription.name(), partition.partition()));
          if (segmentStats != null) {
            partitionDto.segmentCount(segmentStats.getSegmentsCount());
            partitionDto.segmentSize(segmentStats.getSegmentSize());
          }

          return partitionDto.build();
        })
        .collect(Collectors.toList());

    topic.partitions(partitions.stream().collect(
        Collectors.toMap(InternalPartition::getPartition, t -> t)));

    var partitionsStats = new PartitionsStats(topicDescription);
    topic.replicas(partitionsStats.getReplicasCount());
    topic.partitionCount(partitionsStats.getPartitionsCount());
    topic.inSyncReplicas(partitionsStats.getInSyncReplicasCount());
    topic.underReplicatedPartitions(partitionsStats.getUnderReplicatedPartitionCount());

    topic.replicationFactor(
        topicDescription.partitions().isEmpty()
            ? 0
            : topicDescription.partitions().get(0).replicas().size()
    );

    var segmentStats = logDirInfo.getTopicStats().get(topicDescription.name());
    if (segmentStats != null) {
      topic.segmentCount(segmentStats.getSegmentsCount());
      topic.segmentSize(segmentStats.getSegmentSize());
    }

    topic.bytesInPerSec(metrics.getBytesInPerSec().get(topicDescription.name()));
    topic.bytesOutPerSec(metrics.getBytesOutPerSec().get(topicDescription.name()));

    topic.topicConfigs(
        configs.stream().map(InternalTopicConfig::from).collect(Collectors.toList()));

    topic.cleanUpPolicy(
        configs.stream()
            .filter(config -> config.name().equals("cleanup.policy"))
            .findFirst()
            .map(ConfigEntry::value)
            .map(CleanupPolicy::fromString)
            .orElse(CleanupPolicy.UNKNOWN)
    );

    return topic.build();
  }

}
