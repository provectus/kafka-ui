package com.provectus.kafka.ui.cluster.model;

import lombok.Value;

@Value
public class PartitionPosition {
	private int partition;
	private Long position;
}
