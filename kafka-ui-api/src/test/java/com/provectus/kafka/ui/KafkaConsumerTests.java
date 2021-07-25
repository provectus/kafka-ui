package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.BrokerConfig;
import com.provectus.kafka.ui.model.PartitionsIncrease;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponse;
import com.provectus.kafka.ui.model.TopicCreation;
import com.provectus.kafka.ui.model.TopicDetails;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.api.model.TopicConfig;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "60000")
public class KafkaConsumerTests extends AbstractBaseTest {

  @Autowired
  private WebTestClient webTestClient;


  @Test
  public void shouldDeleteRecords() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(new TopicCreation()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isOk();

    try (KafkaTestProducer<String, String> producer = KafkaTestProducer.forKafka(kafka)) {
      Stream.of("one", "two", "three", "four")
          .forEach(value -> producer.send(topicName, value));
    }

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(TopicMessage.class)
        .hasSize(4);

    webTestClient.delete()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isOk();

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(TopicMessage.class)
        .hasSize(0);
  }

  @Test
  public void shouldIncreasePartitionsUpTo10() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(new TopicCreation()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isOk();

    PartitionsIncreaseResponse response = webTestClient.patch()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/partitions",
            LOCAL,
            topicName)
        .bodyValue(new PartitionsIncrease()
            .totalPartitionsCount(10)
        )
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(PartitionsIncreaseResponse.class)
        .returnResult()
        .getResponseBody();

    assert response != null;
    Assertions.assertEquals(10, response.getTotalPartitionsCount());

    TopicDetails topicDetails = webTestClient.get()
        .uri("/api/clusters/{clusterName}/topics/{topicName}",
            LOCAL,
            topicName)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(TopicDetails.class)
        .returnResult()
        .getResponseBody();

    assert topicDetails != null;
    Assertions.assertEquals(10, topicDetails.getPartitionCount());
  }

  @Test
  public void shouldReturn404ForNonExistingTopic() {
    var topicName = UUID.randomUUID().toString();

    webTestClient.delete()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isNotFound();
  }

  @Test
  public void shouldReturnConfigsForBroker() {
    var topicName = UUID.randomUUID().toString();

    List<BrokerConfig> configs = webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/{id}/configs",
            LOCAL,
            1)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(BrokerConfig.class)
        .returnResult()
        .getResponseBody();

    assert configs != null;
    assert !configs.isEmpty();
    Assertions.assertNotEquals(null, configs.get(0).getName());
    Assertions.assertNotEquals(null, configs.get(0).getIsReadOnly());
    Assertions.assertNotEquals(null, configs.get(0).getIsSensitive());
    Assertions.assertNotEquals(null, configs.get(0).getSource());
  }

  @Test
  public void shouldReturn404ForNonExistingBroker() {
    var topicName = UUID.randomUUID().toString();

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/{id}/configs",
            LOCAL,
            0)
        .exchange()
        .expectStatus()
        .isNotFound();
  }

  @Test
  public void shouldRetrieveConfig() {
    var topicName = UUID.randomUUID().toString();

    webTestClient.post()
            .uri("/api/clusters/{clusterName}/topics", LOCAL)
            .bodyValue(new TopicCreation()
                    .name(topicName)
                    .partitions(1)
                    .replicationFactor(1)
                    .configs(Map.of())
            )
            .exchange()
            .expectStatus()
            .isOk();

    WebTestClient.ListBodySpec result = webTestClient.get()
            .uri("/api/clusters/{clusterName}/topics/{topicName}/config", LOCAL, topicName)
            .exchange()
            .expectStatus()
            .isOk()
            .expectBodyList(TopicConfig.class);
  }
}
