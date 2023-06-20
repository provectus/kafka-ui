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

  record SimpleMetric(String name,
                      Map<String, String> labels,
                      BigDecimal value) implements RawMetric {

    @Override
    public RawMetric copyWithValue(BigDecimal newValue) {
      return new SimpleMetric(name, labels, newValue);
    }
  }

}
