package com.provectus.kafka.ui.metrics.prometheus;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MetricGroup {

	private String name;
	private String help;
	private MetricType type;
	private List<MetricValue> metrics = new ArrayList<>();
}
