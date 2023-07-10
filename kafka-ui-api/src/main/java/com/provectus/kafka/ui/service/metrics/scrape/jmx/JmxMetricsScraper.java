package com.provectus.kafka.ui.service.metrics.scrape.jmx;

import static io.prometheus.client.Collector.MetricFamilySamples;

import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import com.provectus.kafka.ui.service.metrics.scrape.PerBrokerScrapedMetrics;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

public class JmxMetricsScraper  {

  private final JmxMetricsRetriever jmxMetricsRetriever;
  private final MetricsScrapeProperties scrapeProperties;

  public JmxMetricsScraper(MetricsScrapeProperties scrapeProperties,
                           JmxMetricsRetriever jmxMetricsRetriever) {
    this.scrapeProperties = scrapeProperties;
    this.jmxMetricsRetriever = jmxMetricsRetriever;
  }

  public Mono<PerBrokerScrapedMetrics> scrape(Collection<Node> nodes) {
    Mono<Map<Integer, List<MetricFamilySamples>>> collected = Flux.fromIterable(nodes)
        .flatMap(n -> jmxMetricsRetriever.retrieveFromNode(scrapeProperties, n).map(metrics -> Tuples.of(n, metrics)))
        .collectMap(
            t -> t.getT1().id(),
            t -> RawMetric.groupIntoMfs(t.getT2()).toList()
        );
    return collected.map(PerBrokerScrapedMetrics::new);
  }
}
