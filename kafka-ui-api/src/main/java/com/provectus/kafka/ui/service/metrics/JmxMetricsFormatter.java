package com.provectus.kafka.ui.service.metrics;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.management.MBeanAttributeInfo;
import javax.management.ObjectName;

/**
 * Converts JMX metrics into JmxExporter prometheus format: <a href="https://github.com/prometheus/jmx_exporter#default-format">format</a>.
 */
class JmxMetricsFormatter {

  // copied from https://github.com/prometheus/jmx_exporter/blob/b6b811b4aae994e812e902b26dd41f29364c0e2b/collector/src/main/java/io/prometheus/jmx/JmxMBeanPropertyCache.java#L15
  private static final Pattern PROPERTY_PATTERN = Pattern.compile(
      "([^,=:\\*\\?]+)=(\"(?:[^\\\\\"]*(?:\\\\.)?)*\"|[^,=:\"]*)");

  static List<RawMetric> constructMetricsList(ObjectName jmxMetric,
                                              MBeanAttributeInfo[] attributes,
                                              Object[] attrValues) {
    String domain = fixIllegalChars(jmxMetric.getDomain());
    LinkedHashMap<String, String> labels = getLabelsMap(jmxMetric);
    String firstLabel = labels.keySet().iterator().next();
    String firstLabelValue = fixIllegalChars(labels.get(firstLabel));
    labels.remove(firstLabel); //removing first label since it's value will be in name

    List<RawMetric> result = new ArrayList<>(attributes.length);
    for (int i = 0; i < attributes.length; i++) {
      String attrName = fixIllegalChars(attributes[i].getName());
      convertNumericValue(attrValues[i]).ifPresent(convertedValue -> {
        String name = String.format("%s_%s_%s", domain, firstLabelValue, attrName);
        var metric = RawMetric.create(name, labels, convertedValue);
        result.add(metric);
      });
    }
    return result;
  }

  private static String fixIllegalChars(String str) {
    return str
        .replace('.', '_')
        .replace('-', '_');
  }

  private static Optional<BigDecimal> convertNumericValue(Object value) {
    if (!(value instanceof Number)) {
      return Optional.empty();
    }
    try {
      if (value instanceof Long) {
        return Optional.of(new BigDecimal((Long) value));
      } else if (value instanceof Integer) {
        return Optional.of(new BigDecimal((Integer) value));
      }
      return Optional.of(new BigDecimal(value.toString()));
    } catch (NumberFormatException nfe) {
      return Optional.empty();
    }
  }

  /**
   * Converts Mbean properties to map keeping order (copied from jmx_exporter repo).
   */
  private static LinkedHashMap<String, String> getLabelsMap(ObjectName mbeanName) {
    LinkedHashMap<String, String> keyProperties = new LinkedHashMap<>();
    String properties = mbeanName.getKeyPropertyListString();
    Matcher match = PROPERTY_PATTERN.matcher(properties);
    while (match.lookingAt()) {
      String labelName = fixIllegalChars(match.group(1)); // label names should be fixed
      String labelValue = match.group(2);
      keyProperties.put(labelName, labelValue);
      properties = properties.substring(match.end());
      if (properties.startsWith(",")) {
        properties = properties.substring(1);
      }
      match.reset(properties);
    }
    return keyProperties;
  }

}
