package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.BrokerTopicLogdirs;
import com.provectus.kafka.ui.model.BrokersLogdirs;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@AutoConfigureWebTestClient(timeout = "60000")
public class LogDirsTest extends AbstractBaseTest {

  @Autowired
  private WebTestClient webTestClient;

  @Test
  public void testAllBrokers() {
    List<BrokersLogdirs> dirs = webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/logdirs", LOCAL)
        .exchange()
        .expectStatus().isOk()
        .expectBody(new ParameterizedTypeReference<List<BrokersLogdirs>>() {})
        .returnResult()
        .getResponseBody();

    assertThat(dirs).hasSize(1);
    BrokersLogdirs dir = dirs.get(0);
    assertThat(dir.getName()).isEqualTo("/var/lib/kafka/data");
    assertThat(dir.getTopics().stream().anyMatch(t -> t.getName().equals("__consumer_offsets")))
        .isTrue();

    BrokerTopicLogdirs topic = dir.getTopics().stream()
        .filter(t -> t.getName().equals("__consumer_offsets"))
        .findAny().get();

    assertThat(topic.getPartitions()).hasSize(1);
    assertThat(topic.getPartitions().get(0).getBroker()).isEqualTo(1);
    assertThat(topic.getPartitions().get(0).getSize()).isPositive();
  }

  @Test
  public void testOneBrokers() {
    List<BrokersLogdirs> dirs = webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/logdirs?broker=1", LOCAL)
        .exchange()
        .expectStatus().isOk()
        .expectBody(new ParameterizedTypeReference<List<BrokersLogdirs>>() {})
        .returnResult()
        .getResponseBody();

    assertThat(dirs).hasSize(1);
    BrokersLogdirs dir = dirs.get(0);
    assertThat(dir.getName()).isEqualTo("/var/lib/kafka/data");
    assertThat(dir.getTopics().stream().anyMatch(t -> t.getName().equals("__consumer_offsets")))
        .isTrue();

    BrokerTopicLogdirs topic = dir.getTopics().stream()
        .filter(t -> t.getName().equals("__consumer_offsets"))
        .findAny().get();

    assertThat(topic.getPartitions()).hasSize(1);
    assertThat(topic.getPartitions().get(0).getBroker()).isEqualTo(1);
    assertThat(topic.getPartitions().get(0).getSize()).isPositive();
  }

  @Test
  public void testWrongBrokers() {
    List<BrokersLogdirs> dirs = webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/logdirs?broker=2", LOCAL)
        .exchange()
        .expectStatus().isOk()
        .expectBody(new ParameterizedTypeReference<List<BrokersLogdirs>>() {})
        .returnResult()
        .getResponseBody();

    assertThat(dirs).isEmpty();
  }
}
