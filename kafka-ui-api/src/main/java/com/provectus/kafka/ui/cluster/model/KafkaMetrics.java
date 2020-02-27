package com.provectus.kafka.ui.cluster.model;

import lombok.Data;

@Data
public class KafkaMetrics {

    Double bytesInPerSec;
    Double bytesOutPerSec;
    Integer brokersCount;
    Integer topicCount;
    Integer activeControllerCount;
    Integer onlinePartitionCount;
    Integer offlinePartitionCount;
    Integer underReplicatedPartitions;
}
