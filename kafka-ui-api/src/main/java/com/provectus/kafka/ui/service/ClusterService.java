package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ClusterMetricsDTO;
import com.provectus.kafka.ui.model.ClusterStatsDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class ClusterService {

  private final ClustersStorage clustersStorage;
  private final ClusterMapper clusterMapper;
  private final MetricsService metricsService;

  public List<ClusterDTO> getClusters() {
    return clustersStorage.getKafkaClusters()
        .stream()
        .map(clusterMapper::toCluster)
        .collect(Collectors.toList());
  }

  public Mono<ClusterStatsDTO> getClusterStats(String name) {
    return Mono.justOrEmpty(
        clustersStorage.getClusterByName(name)
            .map(KafkaCluster::getMetrics)
            .map(clusterMapper::toClusterStats)
    );
  }

  public Mono<ClusterMetricsDTO> getClusterMetrics(String name) {
    return Mono.justOrEmpty(
        clustersStorage.getClusterByName(name)
            .map(KafkaCluster::getMetrics)
            .map(clusterMapper::toClusterMetrics)
    );
  }

  public Mono<ClusterDTO> updateCluster(String clusterName) {
    return clustersStorage.getClusterByName(clusterName)
        .map(cluster -> metricsService.updateClusterMetrics(cluster)
            .doOnNext(updatedCluster -> clustersStorage
                .setKafkaCluster(updatedCluster.getName(), updatedCluster))
            .map(clusterMapper::toCluster))
        .orElse(Mono.error(new ClusterNotFoundException()));
  }
}