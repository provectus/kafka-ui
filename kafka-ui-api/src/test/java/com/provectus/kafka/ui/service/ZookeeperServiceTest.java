package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

class ZookeeperServiceTest extends AbstractIntegrationTest {
  private ZookeeperService zookeeperService;

  @BeforeEach
  void init() {
    AdminClientServiceImpl adminClientService = new AdminClientServiceImpl();
    adminClientService.setClientTimeout(5_000);
    zookeeperService = new ZookeeperService();
  }

  @Test
  void getZkStatusEmptyConfig() {
    KafkaCluster kafkaCluster =
        KafkaCluster.builder()
            .name(LOCAL)
            .bootstrapServers(kafka.getBootstrapServers())
            .properties(new Properties())
            .build();

    ZookeeperService.ZkStatus zkStatus = new ZookeeperService.ZkStatus(ServerStatusDTO.OFFLINE, null);
    StepVerifier.create(zookeeperService.getZkStatus(kafkaCluster))
        .expectNext(zkStatus)
        .verifyComplete();
  }

  @Test
  void getZkStatusWrongConfig() {
    KafkaCluster kafkaCluster =
        KafkaCluster.builder()
            .name(LOCAL)
            .bootstrapServers(kafka.getBootstrapServers())
            .zookeeper("localhost:1000")
            .properties(new Properties())
            .build();

    ZookeeperService.ZkStatus zkStatus = new ZookeeperService.ZkStatus(ServerStatusDTO.OFFLINE, null);
    StepVerifier.create(zookeeperService.getZkStatus(kafkaCluster))
        .expectNext(zkStatus)
        .verifyComplete();
  }

}
