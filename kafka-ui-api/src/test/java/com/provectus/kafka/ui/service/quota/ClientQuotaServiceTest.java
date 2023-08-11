package com.provectus.kafka.ui.service.quota;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ClustersStorage;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

class ClientQuotaServiceTest extends AbstractIntegrationTest {

  @Autowired
  ClientQuotaService quotaService;

  private KafkaCluster cluster;

  @BeforeEach
  void init() {
    cluster = applicationContext.getBean(ClustersStorage.class).getClusterByName(LOCAL).get();
  }

  @ParameterizedTest
  @CsvSource(
      value = {
          "testUser, null, null ",
          "null, testUserId, null",
          "testUser2, testUserId2, null",
          "null, null, 127.0.0.1"
      },
      nullValues = "null"
  )
  void createsQuotaRecord(String user, String clientId, String ip) {
    StepVerifier.create(
            quotaService.upsert(
                cluster,
                user,
                clientId,
                ip,
                Map.of(
                    "producer_byte_rate", 123.0,
                    "consumer_byte_rate", 234.0,
                    "request_percentage", 10.0
                )
            )
        )
        .assertNext(status -> assertThat(status.value()).isEqualTo(201))
        .verifyComplete();
  }

}
