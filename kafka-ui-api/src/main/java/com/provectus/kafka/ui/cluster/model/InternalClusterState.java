package com.provectus.kafka.ui.cluster.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder(toBuilder = true)
public class InternalClusterState {

    private final List<Integer> brokersIds;
    private final InternalClusterMetrics clusterMetrics;
}
