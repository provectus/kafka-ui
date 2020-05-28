package com.provectus.kafka.ui.cluster.model;

import lombok.Value;

import java.util.List;

import com.provectus.kafka.ui.model.PositionType;

@Value
public class ConsumerPosition {

	private PositionType positionType;
	private List<PartitionPosition> partitionPositions;

}
