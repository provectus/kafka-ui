package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.cluster.config.ClustersProperties;
import com.provectus.kafka.ui.cluster.mapper.ClusterMapper;
import lombok.RequiredArgsConstructor;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ClustersStorage {

    private final Map<String, KafkaCluster> kafkaClusters = new ConcurrentHashMap<>();

    public ClustersStorage(ClustersProperties clusterProperties) {
        ClusterMapper clusterMapper = Mappers.getMapper(ClusterMapper.class);

        for (ClustersProperties.Cluster cluster : clusterProperties.getClusters()) {
            if (kafkaClusters.get(cluster.getName()) != null) {
                throw new IllegalStateException("Application config isn't correct. Two clusters can't have the same name");
            }
            kafkaClusters.put(cluster.getName(), clusterMapper.toKafkaCluster(cluster));
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
