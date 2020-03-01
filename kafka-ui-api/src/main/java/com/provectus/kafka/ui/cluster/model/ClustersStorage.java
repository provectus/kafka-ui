package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;

@Component
@RequiredArgsConstructor
public class ClustersStorage {

    private final Map<String, KafkaCluster> kafkaClusters = new HashMap<>();

    private final ClustersProperties clusterProperties;

    private final ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);

    @PostConstruct
    public void init() {
        for (ClustersProperties.Cluster clusterProperties : clusterProperties.getClusters()) {
            if (kafkaClusters.get(clusterProperties.getName()) != null) {
                throw new IllegalStateException("Application config isn't correct. Two clusters can't have the same name");
            }
            kafkaClusters.put(clusterProperties.getName(), clusterMapper.toKafkaCluster(clusterProperties));
        }
    }

    public Collection<KafkaCluster> getKafkaClusters() {
        return kafkaClusters.values();
    }

    public KafkaCluster getClusterByName(String clusterName) {
        return kafkaClusters.get(clusterName);
    }
}
