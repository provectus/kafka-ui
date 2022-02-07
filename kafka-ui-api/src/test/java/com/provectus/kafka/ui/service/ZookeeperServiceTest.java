package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatusDTO;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ContextConfiguration;
import reactor.test.StepVerifier;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
class ZookeeperServiceTest extends AbstractBaseTest {
  private final KafkaCluster kafkaCluster =
      KafkaCluster.builder()
          .name(LOCAL)
          .bootstrapServers(kafka.getBootstrapServers())
          .properties(new Properties())
          .build();

  private ZookeeperService zookeeperService;

  @BeforeEach
  void init() {
    AdminClientServiceImpl adminClientService = new AdminClientServiceImpl();
    adminClientService.setClientTimeout(5_000);
    zookeeperService = new ZookeeperService();
  }

  @Test
  void getZkStatusOffline() {
    ZookeeperService.ZkStatus zkStatus = new ZookeeperService.ZkStatus(ServerStatusDTO.OFFLINE, null);
    StepVerifier.create(zookeeperService.getZkStatus(kafkaCluster))
        .expectNext(zkStatus)
        .verifyComplete();
  }

}