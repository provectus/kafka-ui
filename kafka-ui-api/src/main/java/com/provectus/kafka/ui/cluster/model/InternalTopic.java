package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;
import org.apache.kafka.common.TopicPartition;

import java.util.List;
import java.util.Map;

@Data
@Builder(toBuilder = true)
public class InternalTopic {

    private final String name;
    private final boolean internal;
    private final Map<Integer,InternalPartition> partitions;
    private final List<InternalTopicConfig> topicConfigs;

    private final int replicas;
    private final int partitionCount;
    private final int inSyncReplicas;
    private final int replicationFactor;
    private final int underReplicatedPartitions;
    private final long segmentSize;
    private final long segmentCount;
//    private final Map<TopicPartition, Long> partitionSegmentSize;
}
