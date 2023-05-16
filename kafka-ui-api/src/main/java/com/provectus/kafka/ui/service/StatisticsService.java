package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.ReactiveAdminClient.ClusterDescription;

import com.provectus.kafka.ui.model.ClusterFeature;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.Metrics;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.model.Statistics;
import com.provectus.kafka.ui.service.metrics.MetricsCollector;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

  private final MetricsCollector metricsCollector;
  private final AdminClientService adminClientService;
  private final FeatureService featureService;
  private final StatisticsCache cache;

  public Mono<Statistics> updateCache(KafkaCluster c) {
    return getStatistics(c).doOnSuccess(m -> cache.replace(c, m));
  }

  private Mono<Statistics> getStatistics(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(ac ->
            ac.describeCluster().flatMap(description ->
                ac.updateInternalStats(description.getController()).then(
                    Mono.zip(
                        List.of(
                            metricsCollector.getBrokerMetrics(cluster, description.getNodes()),
                            getLogDirInfo(description, ac),
                            featureService.getAvailableFeatures(ac, cluster, description),
                            loadTopicConfigs(cluster),
                            describeTopics(cluster)),
                        results ->
                            Statistics.builder()
                                .status(ServerStatusDTO.ONLINE)
                                .clusterDescription(description)
                                .version(ac.getVersion())
                                .metrics((Metrics) results[0])
                                .logDirInfo((InternalLogDirStats) results[1])
                                .features((List<ClusterFeature>) results[2])
                                .topicConfigs((Map<String, List<ConfigEntry>>) results[3])
                                .topicDescriptions((Map<String, TopicDescription>) results[4])
                                .build()
                    ))))
        .doOnError(e ->
            log.error("Failed to collect cluster {} info", cluster.getName(), e))
        .onErrorResume(
            e -> Mono.just(Statistics.empty().toBuilder().lastKafkaException(e).build()));
  }

  private Mono<InternalLogDirStats> getLogDirInfo(ClusterDescription desc, ReactiveAdminClient ac) {
    var brokerIds = desc.getNodes().stream().map(Node::id).collect(Collectors.toSet());
    return ac.describeLogDirs(brokerIds).map(InternalLogDirStats::new);
  }

  private Mono<Map<String, TopicDescription>> describeTopics(KafkaCluster c) {
    return adminClientService.get(c).flatMap(ReactiveAdminClient::describeTopics);
  }

  private Mono<Map<String, List<ConfigEntry>>> loadTopicConfigs(KafkaCluster c) {
    return adminClientService.get(c).flatMap(ReactiveAdminClient::getTopicsConfig);
  }

}
