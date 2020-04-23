package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.model.ServerStatus;
import lombok.Data;

@Data
public class InternalCluster {

    private String name;
    private String id;
    private boolean defaultCluster;
    private ServerStatus status;
    private Integer brokerCount;
    private Integer onlinePartitionCount;
    private Integer topicCount;
    private Integer bytesInPerSec;
    private Integer bytesOutPerSec;
}
