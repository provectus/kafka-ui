package com.provectus.kafka.ui.cluster.model;

import lombok.Value;

import java.util.Map;

import com.provectus.kafka.ui.model.SeekType;

@Value
public class ConsumerPosition {

	private SeekType seekType;
	private Map<Integer, Long> seekTo;

}
