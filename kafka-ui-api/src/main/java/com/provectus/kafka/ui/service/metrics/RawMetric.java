package com.provectus.kafka.ui.service.metrics;

import java.math.BigDecimal;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

public interface RawMetric {

  String name();

  Map<String, String> labels();

  BigDecimal value();

  // Key, that can be used for metrics reductions
  default Object identityKey() {
    return name() + "_" + labels();
  }

  RawMetric copyWithValue(BigDecimal newValue);

  //--------------------------------------------------

  static RawMetric create(String name, Map<String, String> labels, BigDecimal value) {
    return new SimpleMetric(name, labels, value);
  }

  @AllArgsConstructor
  @EqualsAndHashCode
  @ToString
  class SimpleMetric implements RawMetric {

    private final String name;
    private final Map<String, String> labels;
    private final BigDecimal value;

    @Override
    public String name() {
      return name;
    }

    @Override
    public Map<String, String> labels() {
      return labels;
    }

    @Override
    public BigDecimal value() {
      return value;
    }

    @Override
    public RawMetric copyWithValue(BigDecimal newValue) {
      return new SimpleMetric(name, labels, newValue);
    }
  }

}
