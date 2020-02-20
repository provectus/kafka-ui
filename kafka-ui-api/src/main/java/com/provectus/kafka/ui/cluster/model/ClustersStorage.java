package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

import static com.provectus.kafka.ui.cluster.model.MetricsConstants.CLUSTER_ID;

@Component
@RequiredArgsConstructor
public class ClustersStorage {

    private final List<KafkaCluster> kafkaClusters = new ArrayList<>();

    private final ClustersProperties clusterProperties;

    private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);

    @PostConstruct
    public void init() {
        for (ClustersProperties.Cluster clusterProperties : clusterProperties.getClusters()) {
            kafkaClusters.add(clusterMapper.toKafkaCluster(clusterProperties));
        }
    }

    public List<KafkaCluster> getKafkaClusters() {
        return kafkaClusters;
    }

    public KafkaCluster getClusterById(String clusterId) {
        return kafkaClusters.stream()
                .filter(cltr -> cltr.getMetricsMap().get(CLUSTER_ID).equals(clusterId))
                .findFirst()
                .orElseThrow();
    }
}
