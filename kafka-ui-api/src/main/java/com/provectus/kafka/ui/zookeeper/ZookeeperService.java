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

    private final ClustersStorage clustersStorage;

    private final Map<String, ZkClient> cachedZkClient = new HashMap<>();

    public void checkZookeeperStatus(KafkaCluster kafkaCluster) {
        var isConnected = false;
        var zkClient = getOrCreateZkClient(kafkaCluster.getName());
        log.debug("Start getting Zookeeper metrics for kafkaCluster: {}", kafkaCluster.getName());
        if (zkClient != null) {
            isConnected = isZkClientConnected(zkClient);
        }
        if (!isConnected) {
            kafkaCluster.getBrokersMetrics().setZooKeeperStatus(ZooKeeperConstants.OFFLINE);
            return;
        }
        kafkaCluster.getBrokersMetrics().setZooKeeperStatus(ZooKeeperConstants.ONLINE);
    }

    private boolean isZkClientConnected(ZkClient zkClient) {
        try {
            zkClient.getChildren("/brokers/ids");
            return true;
        } catch (Exception e) {
            log.error(e);
            return false;
        }
    }

    private ZkClient getOrCreateZkClient (String clusterName) {
        try {
            return cachedZkClient.getOrDefault(clusterName, new ZkClient(clustersStorage.getClusterByName(clusterName).getZookeeper(), 1000));
        } catch (Exception e) {
            log.error("Error while creating zookeeper client for cluster {}", clusterName);
            return null;
        }
    }
}
