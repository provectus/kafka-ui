package com.provectus.kafka.ui.service.metrics;

import static io.prometheus.client.Collector.*;

import io.prometheus.client.Collector;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
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

  static Stream<MetricFamilySamples> groupIntoMFS(Collection<RawMetric> lst) {
    //TODO: impl
    return null;
  }

  static RawMetric create(String name, Map<String, String> labels, BigDecimal value) {
    return new SimpleMetric(name, labels, value);
  }

  static Stream<RawMetric> create(MetricFamilySamples samples) {
    return samples.samples.stream()
        .map(s -> create(
                s.name,
                IntStream.range(0, s.labelNames.size())
                    .boxed()
                    .collect(Collectors.<Integer, String, String>toMap(s.labelNames::get, s.labelValues::get)),
                BigDecimal.valueOf(s.value)
            )
        );
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
