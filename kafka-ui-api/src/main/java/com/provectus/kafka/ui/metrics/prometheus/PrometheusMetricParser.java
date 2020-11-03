package com.provectus.kafka.ui.metrics.prometheus;

import lombok.extern.log4j.Log4j2;

import java.io.BufferedReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Log4j2
@Service
public class PrometheusMetricParser {

	private static final String HELP_PREFIX = "# HELP";
	private static final String TYPE_PREFIX = "# TYPE";
	private static final Pattern VALUE_LINE_PATTERN = Pattern.compile("(.*?)\\s([0-9.]+)");
	private static final Pattern DIMENSIONS_PATTERN = Pattern.compile("(.*?)=\\\"(.*?)\\\",");

	public List<MetricGroup> parse(String metrics) {
		List<MetricGroup> metricGroups = new ArrayList<>();

		try {
			BufferedReader bufReader = new BufferedReader(new StringReader(metrics));

			String line;
			MetricGroup metricGroup = null;
			while ((line = bufReader.readLine()) != null) {
				if (line.startsWith(HELP_PREFIX)) {
					metricGroup = parseNewMetricGroup(line);
					metricGroups.add(metricGroup);
				} else if (line.startsWith(TYPE_PREFIX)) {
					parseMetricGroupType(metricGroup, line);
				} else {
					parseMetricGroupValue(metricGroup, line);
				}
			}
		} catch (Exception e) {
			log.error("Something went wrong while parsing metrics.", e);
			return Collections.emptyList();
		}

		return metricGroups;
	}

	private MetricGroup parseNewMetricGroup(String helpLine) {
		String[] lineParts = helpLine.split("\\s", 4);

		MetricGroup metricGroup = new MetricGroup();
		metricGroup.setName(lineParts[2]);
		metricGroup.setHelp(lineParts[3]);
		return metricGroup;
	}

	private void parseMetricGroupType(MetricGroup metricGroup, String typeLine) {
		String[] lineParts = typeLine.split("\\s", 4);

		metricGroup.setType(MetricType.valueOf(lineParts[3].toUpperCase()));
	}

	private void parseMetricGroupValue(MetricGroup metricGroup, String valueLine) {
		MetricValue metricValue = new MetricValue();
		metricGroup.getMetrics().add(metricValue);

		Matcher valueLineMatcher = VALUE_LINE_PATTERN.matcher(valueLine);
		if (valueLineMatcher.find()) {
			String dimensionsAndMetricNameStr = valueLineMatcher.group(1);
			String valueStr = valueLineMatcher.group(2);

			if (!dimensionsAndMetricNameStr.equals(metricGroup.getName())) {
				String dimensionStr = dimensionsAndMetricNameStr.substring(metricGroup.getName().length() + 1, dimensionsAndMetricNameStr.length() - 1);
				Matcher m = DIMENSIONS_PATTERN.matcher(dimensionStr);
				while (m.find()) {
					metricValue.getDimensions().put(m.group(1), m.group(2));
				}
			}

			double value = Double.parseDouble(valueStr);
			metricValue.setValue(value);
		}
	}
}
