package com.provectus.kafka.ui.model;

import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalSegmentSizeDto {

  private final Map<String, InternalTopic> internalTopicWithSegmentSize;
  private final InternalClusterMetrics clusterMetricsWithSegmentSize;
}
