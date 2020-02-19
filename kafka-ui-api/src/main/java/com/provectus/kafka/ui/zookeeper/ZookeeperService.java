package com.provectus.kafka.ui.zookeeper;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.I0Itec.zkclient.ZkClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import static com.provectus.kafka.ui.cluster.model.MetricsConstants.ZOOKEEPER_STATUS;

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
            kafkaCluster.putMetric(ZOOKEEPER_STATUS, "0");
            kafkaCluster.setZookeeperStatus(ServerStatus.OFFLINE);
            return;
        }

        kafkaCluster.putMetric(ZOOKEEPER_STATUS, "1");
        kafkaCluster.setZookeeperStatus(ServerStatus.ONLINE);
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
