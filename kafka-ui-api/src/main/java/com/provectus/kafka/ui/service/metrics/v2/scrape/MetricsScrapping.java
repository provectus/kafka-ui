package com.provectus.kafka.ui.service.metrics.v2.scrape;

import static com.provectus.kafka.ui.config.ClustersProperties.*;
import static com.provectus.kafka.ui.model.MetricsScrapeProperties.*;

import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.MetricsScrapeProperties;
import com.provectus.kafka.ui.service.metrics.v2.scrape.inferred.InferredMetrics;
import com.provectus.kafka.ui.service.metrics.v2.scrape.inferred.InferredMetricsScraper;
import com.provectus.kafka.ui.service.metrics.v2.scrape.jmx.JmxMetricsRetriever;
import com.provectus.kafka.ui.service.metrics.v2.scrape.jmx.JmxMetricsScraper;
import com.provectus.kafka.ui.service.metrics.v2.scrape.prometheus.PrometheusScraper;
import jakarta.annotation.Nullable;
import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class MetricsScrapping {

  private final InferredMetricsScraper inferredMetricsScraper;

  @Nullable
  private final JmxMetricsScraper jmxMetricsScraper;

  @Nullable
  private final PrometheusScraper prometheusScraper;

  public static MetricsScrapping create(Cluster cluster,
                                        JmxMetricsRetriever jmxMetricsRetriever) {
    InferredMetricsScraper inferredMetricsScraper = new InferredMetricsScraper();
    JmxMetricsScraper jmxMetricsScraper = null;
    PrometheusScraper prometheusScraper = null;

    var metrics = cluster.getMetrics();
    if (cluster.getMetrics() != null) {
      var scrapeProperties = createScrapeProps(cluster);
      if (metrics.getType() == null || metrics.getType().equalsIgnoreCase(JMX_METRICS_TYPE)) {
        jmxMetricsScraper = new JmxMetricsScraper(scrapeProperties, jmxMetricsRetriever);
      } else if (metrics.getType().equalsIgnoreCase(PROMETHEUS_METRICS_TYPE)) {
        prometheusScraper = new PrometheusScraper(scrapeProperties);
      }
    }
    return new MetricsScrapping(inferredMetricsScraper, jmxMetricsScraper, prometheusScraper);
  }

  private static MetricsScrapeProperties createScrapeProps(Cluster cluster) {
    var metrics = cluster.getMetrics();
    return MetricsScrapeProperties.builder()
        .port(metrics.getPort())
        .ssl(metrics.getSsl())
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
    Mono<? extends PerBrokerScrapedMetrics> external = scrapeExternal(nodes);
    return inferred.zipWith(
        external,
        (inf, ext) -> Metrics.builder()
            .ioRates(ext.ioRates())
            .perBrokerScrapedMetrics(ext.getPerBrokerMetrics())
            .inferredMetrics(inf)
            .build()
    );
  }

  private Mono<? extends PerBrokerScrapedMetrics> scrapeExternal(Collection<Node> nodes) {
    if (jmxMetricsScraper != null) {
      return jmxMetricsScraper.scrape(nodes);
    }
    if (prometheusScraper != null) {
      return prometheusScraper.scrape(nodes);
    }
    return Mono.just(PerBrokerScrapedMetrics.empty());
  }

}
