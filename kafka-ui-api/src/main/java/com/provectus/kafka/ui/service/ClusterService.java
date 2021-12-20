package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
import com.provectus.kafka.ui.model.InternalClusterState;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClusterService {

  private final MetricsCache metricsCache;
  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final MetricsService metricsService;

  public List<ClusterDTO> getClusters() {
    return clustersStorage.getKafkaClusters()
        .stream()
        .map(c -> clusterMapper.toCluster(new InternalClusterState(c, metricsCache.get(c))))
        .collect(Collectors.toList());
  }

  public Mono<ClusterStatsDTO> getClusterStats(KafkaCluster cluster) {
    return Mono.justOrEmpty(
        clusterMapper.toClusterStats(
            new InternalClusterState(cluster, metricsCache.get(cluster)))
    );
  }

  public Mono<ClusterMetricsDTO> getClusterMetrics(KafkaCluster cluster) {
    return Mono.just(
        clusterMapper.toClusterMetrics(
            metricsCache.get(cluster).getJmxMetrics()));
  }

  public Mono<ClusterDTO> updateCluster(KafkaCluster cluster) {
    return metricsService.updateCache(cluster)
        .map(metrics -> clusterMapper.toCluster(new InternalClusterState(cluster, metrics)));
  }
}