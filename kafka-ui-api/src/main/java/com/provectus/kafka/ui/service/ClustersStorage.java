package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ClustersStorage {

    private final Map<String, KafkaCluster> kafkaClusters = new ConcurrentHashMap<>();

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

    public Optional<KafkaCluster> getClusterByName(String clusterName) {
        return Optional.ofNullable(kafkaClusters.get(clusterName));
    }

    public void setKafkaCluster(String key, KafkaCluster kafkaCluster) {
        this.kafkaClusters.put(key, kafkaCluster);
    }

    public Map<String, KafkaCluster> getKafkaClustersMap() {
        return kafkaClusters;
    }
}
