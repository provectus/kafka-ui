package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.MetricsConstants;
import com.provectus.kafka.ui.model.Cluster;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClusterService {

    private final List<KafkaCluster> kafkaClusters = new ArrayList<>();

    private final ClustersProperties clusterProperties;

    private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);

    @PostConstruct
    public void init() {
        for (ClustersProperties.Cluster clusterProperties : clusterProperties.getClusters()) {
            kafkaClusters.add(clusterMapper.toKafkaCluster(clusterProperties));
        }
    }

    public Mono<ResponseEntity<Flux<Cluster>>> getClusters() {
        List<Cluster> clusters = kafkaClusters
                .stream()
                .map(kafkaCluster -> {
                    Cluster cluster = clusterMapper.toOpenApiCluster(kafkaCluster);
                    cluster.setBrokerCount(intValueOfOrNull(kafkaCluster.getMetric(MetricsConstants.BROKERS_COUNT)));
                    cluster.setTopicCount(intValueOfOrNull(kafkaCluster.getMetric(MetricsConstants.TOPIC_COUNT)));
                    cluster.setBytesInPerSec(intValueOfOrNull(kafkaCluster.getMetric(MetricsConstants.BYTES_IN_PER_SEC)));
                    cluster.setBytesOutPerSec(intValueOfOrNull(kafkaCluster.getMetric(MetricsConstants.BYTES_OUT_PER_SEC)));
                    cluster.setOnlinePartitionCount(intValueOfOrNull(kafkaCluster.getMetric(MetricsConstants.PARTITIONS_COUNT)));
                    return cluster;
                })
                .collect(Collectors.toList());

        return Mono.just(ResponseEntity.ok(Flux.fromIterable(clusters)));
    }

    public List<KafkaCluster> getKafkaClusters() {
        return kafkaClusters;
    }

    private Integer intValueOfOrNull(String s) {
        try {
            return Integer.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }


}
