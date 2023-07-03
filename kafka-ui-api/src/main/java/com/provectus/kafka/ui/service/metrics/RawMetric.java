package com.provectus.kafka.ui.service.metrics;

import static io.prometheus.client.Collector.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

public interface RawMetric {

  String name();

  Map<String, String> labels();

  BigDecimal value();

  //--------------------------------------------------

  static RawMetric create(String name, Map<String, String> labels, BigDecimal value) {
    return new SimpleMetric(name, labels, value);
  }

  static Stream<MetricFamilySamples> groupIntoMFS(Collection<RawMetric> lst) {
    Map<String, MetricFamilySamples> map = new LinkedHashMap<>();
    for (RawMetric m : lst) {
      var mfs = map.get(m.name());
      if (mfs == null) {
        mfs = new MetricFamilySamples(m.name(), Type.GAUGE, m.name(), new ArrayList<>());
        map.put(m.name(), mfs);
      }
      List<String> lbls = m.labels().keySet().stream().toList();
      List<String> lblVals = lbls.stream().map(l -> m.labels().get(l)).toList();
      mfs.samples.add(new MetricFamilySamples.Sample(m.name(), lbls, lblVals, m.value().doubleValue()));
    }
    return map.values().stream();
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

  record SimpleMetric(String name, Map<String, String> labels, BigDecimal value) implements RawMetric {
  }

}
