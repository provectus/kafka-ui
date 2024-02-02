package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.config.ClustersProperties;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.TopicPartition;

@Data
@Builder(toBuilder = true)
public class InternalTopic {

  ClustersProperties clustersProperties;

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
  private final BigDecimal messageInMeanRate;
  private final BigDecimal messageInOneMinuteRate;
  private final BigDecimal messageInFiveMinuteRate;
  private final BigDecimal messageInFifteenMinuteRate;
  private final BigDecimal fetchRequestsMeanRate;
  private final BigDecimal fetchRequestsOneMinuteRate;
  private final BigDecimal fetchRequestsFiveMinuteRate;
  private final BigDecimal fetchRequestsFifteenMinuteRate;
  private final BigDecimal produceRequestsMeanRate;
  private final BigDecimal produceRequestsOneMinuteRate;
  private final BigDecimal produceRequestsFiveMinuteRate;
  private final BigDecimal produceRequestsFifteenMinuteRate;

  // from log dir data
  private final long segmentSize;
  private final long segmentCount;

  public static InternalTopic from(TopicDescription topicDescription,
                                   List<ConfigEntry> configs,
                                   InternalPartitionsOffsets partitionsOffsets,
                                   Metrics metrics,
                                   InternalLogDirStats logDirInfo,
                                   @Nullable String internalTopicPrefix) {
    var topic = InternalTopic.builder();

    internalTopicPrefix = internalTopicPrefix == null || internalTopicPrefix.isEmpty()
        ? "_"
        : internalTopicPrefix;

    topic.internal(
        topicDescription.isInternal() || topicDescription.name().startsWith(internalTopicPrefix)
    );
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
        .toList();

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

    topic.bytesInPerSec(metrics.getTopicBytesInPerSec().get(topicDescription.name()) == null
            ? BigDecimal.ZERO : metrics.getTopicBytesInPerSec().get(topicDescription.name()));
    topic.bytesOutPerSec(metrics.getTopicBytesOutPerSec().get(topicDescription.name()) == null 
            ? BigDecimal.ZERO : metrics.getTopicBytesOutPerSec().get(topicDescription.name()));
        
    topic.messageInMeanRate(metrics.getMessageInMeanRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getMessageInMeanRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.messageInOneMinuteRate(metrics.getMessageInOneMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getMessageInOneMinuteRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.messageInFiveMinuteRate(metrics.getMessageInFiveMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getMessageInFiveMinuteRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.messageInFifteenMinuteRate(metrics.getMessageInFifteenMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getMessageInFifteenMinuteRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
        
    topic.fetchRequestsMeanRate(metrics.getFetchRequestsMeanRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getFetchRequestsMeanRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.fetchRequestsOneMinuteRate(metrics.getFetchRequestsOneMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getFetchRequestsOneMinuteRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.fetchRequestsFiveMinuteRate(metrics.getFetchRequestsFiveMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getFetchRequestsFiveMinuteRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.fetchRequestsFifteenMinuteRate(metrics.getFetchRequestsFifteenMinuteRate().get(
            topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getFetchRequestsFifteenMinuteRate().get(topicDescription.name())
                .setScale(2, RoundingMode.HALF_UP));
            
    topic.produceRequestsMeanRate(metrics.getProduceRequestsMeanRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getProduceRequestsMeanRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.produceRequestsOneMinuteRate(metrics.getProduceRequestsOneMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getProduceRequestsOneMinuteRate().get(topicDescription.name()).setScale(2, RoundingMode.HALF_UP));
    topic.produceRequestsFiveMinuteRate(metrics.getProduceRequestsFiveMinuteRate().get(topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getProduceRequestsFiveMinuteRate().get(topicDescription.name())
                .setScale(2, RoundingMode.HALF_UP));
    topic.produceRequestsFifteenMinuteRate(metrics.getProduceRequestsFifteenMinuteRate().get(
            topicDescription.name()) == null
            ? BigDecimal.ZERO 
            : metrics.getProduceRequestsFifteenMinuteRate().get(topicDescription.name())
                .setScale(2, RoundingMode.HALF_UP));

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
