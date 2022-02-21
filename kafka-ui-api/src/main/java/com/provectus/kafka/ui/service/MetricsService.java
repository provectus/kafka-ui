package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.InternalLogDirStats;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import com.provectus.kafka.ui.util.JmxClusterUtil;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

  private final ZookeeperService zookeeperService;
  private final JmxClusterUtil jmxClusterUtil;
  private final AdminClientService adminClientService;
  private final FeatureService featureService;
  private final MetricsCache cache;

  public Mono<MetricsCache.Metrics> updateCache(KafkaCluster c) {
    return getMetrics(c).doOnSuccess(m -> cache.replace(c, m));
  }

  private Mono<MetricsCache.Metrics> getMetrics(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(ac ->
            ac.describeCluster().flatMap(description ->
                Mono.zip(
                    List.of(
                        jmxClusterUtil.getBrokerMetrics(cluster, description.getNodes()),
                        zookeeperService.getZkStatus(cluster),
                        getLogDirInfo(cluster, ac),
                        featureService.getAvailableFeatures(cluster, description.getController()),
                        loadTopicConfigs(cluster),
                        describeTopics(cluster)),
                    results ->
                        MetricsCache.Metrics.builder()
                            .status(ServerStatusDTO.ONLINE)
                            .clusterDescription(description)
                            .version(ac.getVersion())
                            .jmxMetrics((JmxClusterUtil.JmxMetrics) results[0])
                            .zkStatus((ZookeeperService.ZkStatus) results[1])
                            .logDirInfo((InternalLogDirStats) results[2])
                            .features((List<Feature>) results[3])
                            .topicConfigs((Map<String, List<ConfigEntry>>) results[4])
                            .topicDescriptions((Map<String, TopicDescription>) results[5])
                            .build()
                )))
        .doOnError(e ->
            log.error("Failed to collect cluster {} info", cluster.getName(), e))
        .onErrorResume(
            e -> Mono.just(MetricsCache.empty().toBuilder().lastKafkaException(e).build()));
  }

  private Mono<InternalLogDirStats> getLogDirInfo(KafkaCluster cluster, ReactiveAdminClient c) {
    if (!cluster.isDisableLogDirsCollection()) {
      return c.describeLogDirs().map(InternalLogDirStats::new);
    }
    return Mono.just(InternalLogDirStats.empty());
  }

  private Mono<Map<String, TopicDescription>> describeTopics(KafkaCluster c) {
    return adminClientService.get(c).flatMap(ReactiveAdminClient::describeTopics);
  }

  private Mono<Map<String, List<ConfigEntry>>> loadTopicConfigs(KafkaCluster c) {
    return adminClientService.get(c).flatMap(ReactiveAdminClient::getTopicsConfig);
  }

}
