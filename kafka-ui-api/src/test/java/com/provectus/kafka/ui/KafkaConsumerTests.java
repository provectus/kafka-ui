package com.provectus.kafka.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.TEXT_EVENT_STREAM;

import com.provectus.kafka.ui.api.model.TopicConfig;
import com.provectus.kafka.ui.model.BrokerConfig;
import com.provectus.kafka.ui.model.PartitionsIncrease;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponse;
import com.provectus.kafka.ui.model.TopicCreation;
import com.provectus.kafka.ui.model.TopicDetails;
import com.provectus.kafka.ui.model.TopicMessageEvent;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import java.util.List;
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

    long count = webTestClient.get()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .accept(TEXT_EVENT_STREAM)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(TopicMessageEvent.class)
        .returnResult()
        .getResponseBody()
        .stream()
        .filter(e -> e.getType().equals(TopicMessageEvent.TypeEnum.MESSAGE))
        .count();

    assertThat(count).isEqualTo(4);

    webTestClient.delete()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isOk();

    count = webTestClient.get()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBodyList(TopicMessageEvent.class)
        .returnResult()
        .getResponseBody()
        .stream()
        .filter(e -> e.getType().equals(TopicMessageEvent.TypeEnum.MESSAGE))
        .count();

    assertThat(count).isZero();
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

    webTestClient.get()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/config", LOCAL, topicName)
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

    Assertions.assertNotNull(configs);
    assert !configs.isEmpty();
    Assertions.assertNotNull(configs.get(0).getName());
    Assertions.assertNotNull(configs.get(0).getIsReadOnly());
    Assertions.assertNotNull(configs.get(0).getIsSensitive());
    Assertions.assertNotNull(configs.get(0).getSource());
    Assertions.assertNotNull(configs.get(0).getSynonyms());
  }

  @Test
  public void shouldReturn404ForNonExistingBroker() {
    webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/{id}/configs",
            LOCAL,
            0)
        .exchange()
        .expectStatus()
        .isNotFound();
  }

  @Test
  public void shouldRetrieveTopicConfig() {
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

    List<TopicConfig> configs = webTestClient.get()
            .uri("/api/clusters/{clusterName}/topics/{topicName}/config", LOCAL, topicName)
            .exchange()
            .expectStatus()
            .isOk()
            .expectBodyList(TopicConfig.class)
            .returnResult()
            .getResponseBody();

    Assertions.assertNotNull(configs);
    assert !configs.isEmpty();
    Assertions.assertNotNull(configs.get(0).getName());
    Assertions.assertNotNull(configs.get(0).getIsReadOnly());
    Assertions.assertNotNull(configs.get(0).getIsSensitive());
    Assertions.assertNotNull(configs.get(0).getSource());
    Assertions.assertNotNull(configs.get(0).getSynonyms());
  }
}
