package com.provectus.kafka.ui.metrics.prometheus;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class MetricValue {

	private Map<String, String> dimensions = new HashMap<>();
	private double value;
}
