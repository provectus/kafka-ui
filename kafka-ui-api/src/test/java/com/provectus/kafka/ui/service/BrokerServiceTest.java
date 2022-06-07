package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.model.BrokerDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

class BrokerServiceTest extends AbstractIntegrationTest {

  @Autowired
  private BrokerService brokerService;

  @Autowired
  private ClustersStorage clustersStorage;

  @Test
  void getBrokersReturnsFilledBrokerDto() {
    BrokerDTO expectedBroker = new BrokerDTO();
    expectedBroker.setId(1);
    expectedBroker.setHost(kafka.getHost());
    expectedBroker.setPort(kafka.getFirstMappedPort());

    var localCluster = clustersStorage.getClusterByName(LOCAL).get();
    StepVerifier.create(brokerService.getBrokers(localCluster))
        .expectNext(expectedBroker)
        .verifyComplete();
  }

}