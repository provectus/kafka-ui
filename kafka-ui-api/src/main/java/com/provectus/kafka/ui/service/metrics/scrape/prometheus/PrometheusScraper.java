package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.scrape.PerBrokerScrapedMetrics;
import io.prometheus.client.Collector;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

public class PrometheusScraper {

  private final static PrometheusMetricsRetriever RETRIEVER = new PrometheusMetricsRetriever();

  private final MetricsScrapeProperties metricsConfig;

  public PrometheusScraper(MetricsScrapeProperties metricsConfig) {
    this.metricsConfig = metricsConfig;
  }

  public Mono<PerBrokerScrapedMetrics> scrape(Collection<Node> clusterNodes) {
    Mono<Map<Integer, List<Collector.MetricFamilySamples>>> collected = Flux.fromIterable(clusterNodes)
        .flatMap(n -> RETRIEVER.retrieve(metricsConfig, n).map(metrics -> Tuples.of(n, metrics)))
        .collectMap(t -> t.getT1().id(), t -> t.getT2());

    return collected.map(PerBrokerScrapedMetrics::new);
  }
}
