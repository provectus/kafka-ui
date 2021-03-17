package com.provectus.kafka.ui.model;

import lombok.Value;

import java.util.Map;

@Value
public class ConsumerPosition {

	private SeekType seekType;
	private Map<Integer, Long> seekTo;

}
