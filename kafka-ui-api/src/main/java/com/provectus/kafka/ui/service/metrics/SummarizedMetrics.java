package com.provectus.kafka.ui.service.metrics;

import static java.util.stream.Collectors.toMap;

import com.google.common.collect.Streams;
import com.provectus.kafka.ui.model.Metrics;
import groovy.lang.Tuple;
import io.prometheus.client.Collector.MetricFamilySamples;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SummarizedMetrics {

  private final Metrics metrics;

  public Stream<MetricFamilySamples> asStream() {
    return Streams.concat(
        metrics.getInferredMetrics().asStream(),
        metrics.getPerBrokerScrapedMetrics()
            .values()
            .stream()
            .flatMap(Collection::stream)
            .collect(toMap(mfs -> mfs.name, Optional::of, SummarizedMetrics::summarizeMfs, LinkedHashMap::new))
            .values()
            .stream()
            .filter(Optional::isPresent)
            .map(Optional::get)
    );
  }

  //returns Optional.empty if merging not supported for metric type
  private static Optional<MetricFamilySamples> summarizeMfs(Optional<MetricFamilySamples> mfs1opt,
                                                            Optional<MetricFamilySamples> mfs2opt) {
    if ((mfs1opt.isEmpty() || mfs2opt.isEmpty()) || (mfs1opt.get().type != mfs2opt.get().type)) {
      return Optional.empty();
    }
    var mfs1 = mfs1opt.get();
    return switch (mfs1.type) {
      case GAUGE, COUNTER -> Optional.of(
          new MetricFamilySamples(
              mfs1.name,
              mfs1.type,
              mfs1.help,
              Stream.concat(mfs1.samples.stream(), mfs2opt.get().samples.stream())
                  .collect(
                      toMap(
                          // merging samples with same labels
                          s -> Tuple.tuple(s.name, s.labelNames, s.labelValues),
                          s -> s,
                          (s1, s2) -> new MetricFamilySamples.Sample(
                              s1.name,
                              s1.labelNames,
                              s1.labelValues,
                              s1.value + s2.value
                          ),
                          LinkedHashMap::new
                      )
                  )
                  .values()
                  .stream()
                  .toList()
          )
      );
      default -> Optional.empty();
    };
  }


}
