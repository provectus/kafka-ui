package com.provectus.kafka.ui.service.metrics;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.math.NumberUtils;

@Slf4j
class PrometheusEndpointMetricsParser {

  /**
   * Matches openmetrics format. For example, string:
   * kafka_server_BrokerTopicMetrics_FiveMinuteRate{name="BytesInPerSec",topic="__consumer_offsets",} 16.94886650744339
   * will produce:
   * name=kafka_server_BrokerTopicMetrics_FiveMinuteRate
   * value=16.94886650744339
   * labels={name="BytesInPerSec", topic="__consumer_offsets"}",
   */
  private static final Pattern PATTERN = Pattern.compile(
      "(?<metricName>^\\w+)([ \t]*\\{*(?<properties>.*)}*)[ \\t]+(?<value>[\\d]+\\.?[\\d]+)?");

  static Optional<RawMetric> parse(String s) {
    Matcher matcher = PATTERN.matcher(s);
    if (matcher.matches()) {
      String value = matcher.group("value");
      String metricName = matcher.group("metricName");
      if (metricName == null || !NumberUtils.isCreatable(value)) {
        return Optional.empty();
      }
      var labels = Arrays.stream(matcher.group("properties").split(","))
          .filter(str -> !"".equals(str))
          .map(str -> str.split("="))
          .filter(spit -> spit.length == 2)
          .collect(Collectors.toUnmodifiableMap(
              str -> str[0].trim(),
              str -> str[1].trim().replace("\"", "")));

      return Optional.of(RawMetric.create(metricName, labels, new BigDecimal(value)));
    }
    return Optional.empty();
  }
}
