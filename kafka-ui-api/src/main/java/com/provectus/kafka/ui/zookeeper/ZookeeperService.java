package com.provectus.kafka.ui.zookeeper;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.I0Itec.zkclient.ZkClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class ZookeeperService {

    @Async
    public void checkZookeeperStatus(KafkaCluster kafkaCluster) {
        log.debug("Start getting Zookeeper metrics for kafkaCluster: " + kafkaCluster.getName());
        boolean isConnected = false;
        if (kafkaCluster.getZkClient() != null) {
            isConnected = isZkClientConnected(kafkaCluster);
        }
        if (kafkaCluster.getZkClient() == null || !isConnected) {
            isConnected = createZookeeperConnection(kafkaCluster);
        }

        if (!isConnected) {
            kafkaCluster.getBrokersMetrics().setZooKeeperStatus(ZooKeeperConstants.OFFLINE);

            return;
        }

        kafkaCluster.getBrokersMetrics().setZooKeeperStatus(ZooKeeperConstants.ONLINE);
    }

    private boolean createZookeeperConnection(KafkaCluster kafkaCluster) {
        try {
            kafkaCluster.setZkClient(new ZkClient(kafkaCluster.getZookeeper(), 1000));

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastZookeeperException(e);

            return false;
        }
    }

    private boolean isZkClientConnected(KafkaCluster kafkaCluster) {
        try {
            kafkaCluster.getZkClient().getChildren("/brokers/ids");

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastZookeeperException(e);

            return false;
        }
    }
}
