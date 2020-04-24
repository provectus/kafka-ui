package com.provectus.kafka.ui.zookeeper;

import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.I0Itec.zkclient.ZkClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class ZookeeperService {

    private final Map<String, ZkClient> cachedZkClient = new HashMap<>();

    public boolean isZookeeperOnline(KafkaCluster kafkaCluster) {
        var isConnected = false;
        var zkClient = getOrCreateZkClient(kafkaCluster);
        log.debug("Start getting Zookeeper metrics for kafkaCluster: {}", kafkaCluster.getName());
        if (zkClient != null) {
            isConnected = isZkClientConnected(zkClient);
        }
        return isConnected;
    }

    private boolean isZkClientConnected(ZkClient zkClient) {
        zkClient.getChildren("/brokers/ids");
        return true;
    }

    private ZkClient getOrCreateZkClient (KafkaCluster cluster) {
        try {
            return cachedZkClient.getOrDefault(cluster.getName(), new ZkClient(cluster.getZookeeper(), 1000));
        } catch (Exception e) {
            log.error("Error while creating zookeeper client for cluster {}", cluster.getName());
            return null;
        }
    }
}
