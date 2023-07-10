package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.ReactiveAdminClient.ClusterDescription;

import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.model.Statistics;
import com.provectus.kafka.ui.service.metrics.scrape.ScrapedClusterState;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

  private final AdminClientService adminClientService;
  private final FeatureService featureService;
  private final StatisticsCache cache;

  public Mono<Statistics> updateCache(KafkaCluster c) {
    return getStatistics(c).doOnSuccess(m -> cache.replace(c, m));
  }

  private Mono<Statistics> getStatistics(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(ac ->
            ac.describeCluster()
                .flatMap(description ->
                    ac.updateInternalStats(description.getController())
                        .then(
                            Mono.zip(
                                featureService.getAvailableFeatures(ac, cluster, description),
                                loadClusterState(description, ac)
                            ).flatMap(featuresAndState ->
                                scrapeMetrics(cluster, featuresAndState.getT2(), description)
                                    .map(metrics ->
                                        Statistics.builder()
                                            .status(ServerStatusDTO.ONLINE)
                                            .clusterDescription(description)
                                            .version(ac.getVersion())
                                            .metrics(metrics)
                                            .features(featuresAndState.getT1())
                                            .clusterState(featuresAndState.getT2())
                                            .build())))))
        .doOnError(e ->
            log.error("Failed to collect cluster {} info", cluster.getName(), e))
        .onErrorResume(
            e -> Mono.just(Statistics.empty().toBuilder().lastKafkaException(e).build()));
  }

  private Mono<ScrapedClusterState> loadClusterState(ClusterDescription clusterDescription, ReactiveAdminClient ac) {
    return ScrapedClusterState.scrape(clusterDescription, ac);
  }

  private Mono<Metrics> scrapeMetrics(KafkaCluster cluster,
                                      ScrapedClusterState clusterState,
                                      ClusterDescription clusterDescription) {
    return cluster.getMetricsScrapping().scrape(clusterState, clusterDescription.getNodes());
  }

}
