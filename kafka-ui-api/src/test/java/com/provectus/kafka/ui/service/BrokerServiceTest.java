package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.mapper.ClusterMapperImpl;
import com.provectus.kafka.ui.mapper.DescribeLogDirsMapper;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ContextConfiguration;
import reactor.test.StepVerifier;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
class BrokerServiceTest extends AbstractBaseTest {
  private final KafkaCluster CLUSTER =
      KafkaCluster.builder()
          .name(LOCAL)
          .bootstrapServers(kafka.getBootstrapServers())
          .properties(new Properties())
          .build();

  private BrokerService brokerService;

  @BeforeEach
  void init() {
    AdminClientServiceImpl adminClientService = new AdminClientServiceImpl();
    adminClientService.setClientTimeout(5_000);
    brokerService =
        new BrokerService(new MetricsCache(), adminClientService, new DescribeLogDirsMapper(), new ClusterMapperImpl());
  }

  @Test
  void getBrokersNominal() {
    BrokerDTO brokerDTO = new BrokerDTO();
    brokerDTO.setId(1);
    brokerDTO.setHost("localhost");
    String port = kafka.getBootstrapServers().substring(kafka.getBootstrapServers().lastIndexOf(":") + 1);
    brokerDTO.setPort(Integer.parseInt(port));

    StepVerifier.create(brokerService.getBrokers(CLUSTER))
        .expectNext(brokerDTO)
        .verifyComplete();
  }

  @Test
  void getBrokersNull() {
    assertThatThrownBy(() -> brokerService.getBrokers(null)).isInstanceOf(NullPointerException.class);
  }

  @Test
  void getBrokersEmpty() {
    assertThatThrownBy(() -> brokerService.getBrokers(KafkaCluster.builder().build())).isInstanceOf(
        NullPointerException.class);
  }

}