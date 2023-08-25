package com.provectus.kafka.ui.service.metrics;

import static io.prometheus.client.Collector.MetricFamilySamples;
import static io.prometheus.client.Collector.Type;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public interface RawMetric {

  String name();

  Map<String, String> labels();

  BigDecimal value();

  //--------------------------------------------------

  static RawMetric create(String name, Map<String, String> labels, BigDecimal value) {
    return new SimpleMetric(name, labels, value);
  }

  static Stream<MetricFamilySamples> groupIntoMfs(Collection<RawMetric> rawMetrics) {
    Map<String, MetricFamilySamples> map = new LinkedHashMap<>();
    for (RawMetric m : rawMetrics) {
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

  record SimpleMetric(String name, Map<String, String> labels, BigDecimal value) implements RawMetric { }

}
