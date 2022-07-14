package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.MetricDTO;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JmxExporterMetricsParser {

  public static final String CANONICAL_NAME = "canonicalName";
  private static final String NAME = "name";
  public static final String PROPERTIES = "properties";
  public static final String VALUE = "value";

  /**
   * Matches openmetrics format. For example, string:
   * kafka_server_BrokerTopicMetrics_FiveMinuteRate{name="BytesInPerSec",topic="__consumer_offsets",} 16.94886650744339
   * will produce:
   * canonicalName=kafka_server_BrokerTopicMetrics_FiveMinuteRate
   * name=BytesInPerSec
   * value=16.94886650744339
   * properties=,topic="__consumer_offsets",
   */
  Pattern pattern = Pattern.compile(
      "(?<canonicalName>^\\w+)([ \t]*\\{.*(name=\"(?<name>[\\w+]+)\"(?<properties>.*))\\})[ \\t]+"
          + "(?<value>[\\d]+\\.?[\\d]+)?");

  MetricDTO parse(String s) {
    Matcher matcher = pattern.matcher(s);
    MetricDTO metricDto = null;
    while (matcher.find()) {
      metricDto = new MetricDTO();
      metricDto.setCanonicalName(matcher.group(CANONICAL_NAME));
      String name = matcher.group(NAME);
      metricDto.setName(name);
      metricDto.setParams(
          Arrays.stream(matcher.group(PROPERTIES).split(","))
              .filter(str -> !"".equals(str))
              .map(str -> str.split("="))
              .collect(Collectors.toMap(
                  str -> str[0].trim(),
                  str -> str[1].trim().replace("\"", ""))));
      String value = matcher.group(VALUE);
      if (value == null || name == null) {
        return null;
      }
      metricDto.setValue(Collections.singletonMap(
          getMetricsValueName(metricDto.getCanonicalName()), new BigDecimal(value)));
    }
    return metricDto;
  }

  private String getMetricsValueName(String name) {
    for (JmxMetricsValueName metricsValueName : JmxMetricsValueName.values()) {
      if (name.endsWith(metricsValueName.getValue())) {
        return metricsValueName.getValue();
      }
    }
    return VALUE;
  }
}
