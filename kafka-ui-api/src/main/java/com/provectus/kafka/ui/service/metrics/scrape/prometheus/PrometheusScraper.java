package com.provectus.kafka.ui.service.metrics.scrape.prometheus;

import static io.prometheus.client.Collector.MetricFamilySamples;

import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.scrape.PerBrokerScrapedMetrics;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

public class PrometheusScraper {

  private final PrometheusMetricsRetriever retriever;

  public PrometheusScraper(MetricsScrapeProperties scrapeProperties) {
    this.retriever = new PrometheusMetricsRetriever(scrapeProperties);
  }

  public Mono<PerBrokerScrapedMetrics> scrape(Collection<Node> clusterNodes) {
    Mono<Map<Integer, List<MetricFamilySamples>>> collected = Flux.fromIterable(clusterNodes)
        .flatMap(n -> retriever.retrieve(n.host()).map(metrics -> Tuples.of(n, metrics)))
        .collectMap(t -> t.getT1().id(), Tuple2::getT2);
    return collected.map(PerBrokerScrapedMetrics::new);
  }
}
