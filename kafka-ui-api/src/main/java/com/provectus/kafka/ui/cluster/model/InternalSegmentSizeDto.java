package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder(toBuilder = true)
public class InternalSegmentSizeDto {

    private final Map<String, InternalTopic> internalTopicWithSegmentSize;
    private final InternalClusterMetrics clusterMetricsWithSegmentSize;
}
