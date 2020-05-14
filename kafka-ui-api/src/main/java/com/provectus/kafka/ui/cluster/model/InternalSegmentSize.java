package com.provectus.kafka.ui.cluster.model;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class InternalSegmentSize {

    private final String replicaName;
    private final long segmentSize;
}
