package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.MetricsConstants;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.model.Cluster;
import com.provectus.kafka.ui.model.Topic;
import com.provectus.kafka.ui.model.TopicDetails;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

import static com.provectus.kafka.ui.cluster.model.MetricsConstants.CLUSTER_ID;

@Service
@RequiredArgsConstructor
public class ClusterService {

    private final ClustersStorage clustersStorage;

    private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);


    public Mono<ResponseEntity<Flux<Cluster>>> getClusters() {
        List<Cluster> clusters = clustersStorage.getKafkaClusters()
                .stream()
                .map(kafkaCluster -> {
                    Cluster cluster = clusterMapper.toOpenApiCluster(kafkaCluster);
                    cluster.setId(kafkaCluster.getMetric(CLUSTER_ID));
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

    public Mono<ResponseEntity<BrokerMetrics>> getBrokerMetrics(String clusterId) {
        KafkaCluster cluster = clustersStorage.getClusterById(clusterId);

        BrokerMetrics brokerMetrics = new BrokerMetrics();
        brokerMetrics.setClusterId(cluster.getMetricsMap().get(CLUSTER_ID));
        brokerMetrics.setBrokerCount(intValueOfOrNull(cluster.getMetric(MetricsConstants.BROKERS_COUNT)));
        brokerMetrics.setBytesInPerSec(intValueOfOrNull(cluster.getMetric(MetricsConstants.BYTES_IN_PER_SEC)));
        brokerMetrics.setZooKeeperStatus(intValueOfOrNull(cluster.getMetric(MetricsConstants.ZOOKEEPER_STATUS)));
        brokerMetrics.setActiveControllers(intValueOfOrNull(cluster.getMetric(MetricsConstants.ACTIVE_CONTROLLER_COUNT)));
        brokerMetrics.setOnlinePartitionCount(intValueOfOrNull(cluster.getMetric(MetricsConstants.ONLINE_PARTITION_COUNT)));
        brokerMetrics.setOfflinePartitionCount(intValueOfOrNull(cluster.getMetric(MetricsConstants.OFFLINE_PARTITION_COUNT)));
        brokerMetrics.setUnderReplicatedPartitionCount(intValueOfOrNull(cluster.getMetric(MetricsConstants.UNDER_REPLICATED_PARTITIONS)));

        return Mono.just(ResponseEntity.ok(brokerMetrics));
    }

    public Mono<ResponseEntity<Flux<Topic>>> getTopics(String clusterId) {
        KafkaCluster cluster = clustersStorage.getClusterById(clusterId);

        return Mono.just(ResponseEntity.ok(Flux.fromIterable(cluster.getTopics())));
    }

    private Integer intValueOfOrNull(String s) {
        try {
            return Integer.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public Mono<ResponseEntity<TopicDetails>> getTopicDetails(String clusterId, String topicName) {
        KafkaCluster cluster = clustersStorage.getClusterById(clusterId);
        return Mono.just(ResponseEntity.ok(cluster.getTopicDetails(topicName)));
    }
}
