package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.TopicCreation;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.extern.log4j.Log4j2;
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
  public void shouldReturn404ForNonExistingTopic() {
    var topicName = UUID.randomUUID().toString();

    webTestClient.delete()
        .uri("/api/clusters/{clusterName}/topics/{topicName}/messages", LOCAL, topicName)
        .exchange()
        .expectStatus()
        .isNotFound();
  }
}
