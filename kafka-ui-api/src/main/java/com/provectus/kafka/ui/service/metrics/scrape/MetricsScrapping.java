package com.provectus.kafka.ui.service.metrics.scrape;

import static com.provectus.kafka.ui.config.ClustersProperties.Cluster;
import static com.provectus.kafka.ui.config.ClustersProperties.KeystoreConfig;
import static com.provectus.kafka.ui.model.MetricsScrapeProperties.JMX_METRICS_TYPE;
import static com.provectus.kafka.ui.model.MetricsScrapeProperties.PROMETHEUS_METRICS_TYPE;

import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.scrape.inferred.InferredMetrics;
import com.provectus.kafka.ui.service.metrics.scrape.inferred.InferredMetricsScraper;
import com.provectus.kafka.ui.service.metrics.scrape.jmx.JmxMetricsRetriever;
import com.provectus.kafka.ui.service.metrics.scrape.jmx.JmxMetricsScraper;
import com.provectus.kafka.ui.service.metrics.scrape.prometheus.PrometheusScraper;
import com.provectus.kafka.ui.service.metrics.sink.MetricsSink;
import jakarta.annotation.Nullable;
import java.util.Collection;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
public class MetricsScrapping {

  private final InferredMetricsScraper inferredMetricsScraper;

  @Nullable
  private final JmxMetricsScraper jmxMetricsScraper;

  @Nullable
  private final PrometheusScraper prometheusScraper;

  private final MetricsSink sink;

  public static MetricsScrapping create(Cluster cluster,
                                        JmxMetricsRetriever jmxMetricsRetriever) {
    JmxMetricsScraper jmxMetricsScraper = null;
    PrometheusScraper prometheusScraper = null;
    MetricsSink sink = MetricsSink.noop();

    var metrics = cluster.getMetrics();
    if (cluster.getMetrics() != null) {
      var scrapeProperties = createScrapeProps(cluster);
      if (metrics.getType().equalsIgnoreCase(JMX_METRICS_TYPE) && metrics.getPort() != null) {
        jmxMetricsScraper = new JmxMetricsScraper(scrapeProperties, jmxMetricsRetriever);
      } else if (metrics.getType().equalsIgnoreCase(PROMETHEUS_METRICS_TYPE)) {
        prometheusScraper = new PrometheusScraper(scrapeProperties);
      }
      sink = MetricsSink.create(cluster.getMetrics());
    }
    return new MetricsScrapping(
        new InferredMetricsScraper(),
        jmxMetricsScraper,
        prometheusScraper,
        sink
    );
  }

  private static MetricsScrapeProperties createScrapeProps(Cluster cluster) {
    var metrics = cluster.getMetrics();
    return MetricsScrapeProperties.builder()
        .port(metrics.getPort())
        .ssl(Optional.ofNullable(metrics.getSsl()).orElse(false))
        .username(metrics.getUsername())
        .password(metrics.getPassword())
        .truststoreConfig(cluster.getSsl())
        .keystoreConfig(
            metrics.getKeystoreLocation() != null
                ? new KeystoreConfig(metrics.getKeystoreLocation(), metrics.getKeystorePassword())
                : null
        )
        .build();
  }

  public Mono<Metrics> scrape(ScrapedClusterState clusterState, Collection<Node> nodes) {
    Mono<InferredMetrics> inferred = inferredMetricsScraper.scrape(clusterState);
    Mono<PerBrokerScrapedMetrics> external = scrapeExternal(nodes);
    return inferred.zipWith(
        external,
        (inf, ext) -> Metrics.builder()
            .inferredMetrics(inf)
            .ioRates(ext.ioRates())
            .perBrokerScrapedMetrics(ext.perBrokerMetrics())
            .build()
    ).flatMap(metrics ->
        sink.send(metrics.getSummarizedMetrics())
            .onErrorResume(th -> {
                  log.warn("Error sending metrics to metrics sink", th);
                  return Mono.empty();
                }
            ).thenReturn(metrics)
    );
  }

  private Mono<PerBrokerScrapedMetrics> scrapeExternal(Collection<Node> nodes) {
    if (jmxMetricsScraper != null) {
      return jmxMetricsScraper.scrape(nodes);
    }
    if (prometheusScraper != null) {
      return prometheusScraper.scrape(nodes);
    }
    return Mono.just(PerBrokerScrapedMetrics.empty());
  }

}
