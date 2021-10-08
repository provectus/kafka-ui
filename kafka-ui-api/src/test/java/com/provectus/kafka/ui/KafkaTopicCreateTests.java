package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.TopicCreationDTO;
import java.util.UUID;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "10000")
public class KafkaTopicCreateTests extends AbstractBaseTest {
  @Autowired
  private WebTestClient webTestClient;
  private TopicCreationDTO topicCreation;

  @BeforeEach
  public void setUpBefore() {
    this.topicCreation = new TopicCreationDTO()
        .replicationFactor(1)
        .partitions(3)
        .name(UUID.randomUUID().toString());
  }

  @Test
  void shouldCreateNewTopicSuccessfully() {
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(topicCreation)
        .exchange()
        .expectStatus()
        .isOk();
  }

  @Test
  void shouldReturn400IfTopicAlreadyExists() {
    TopicCreationDTO topicCreation = new TopicCreationDTO()
        .replicationFactor(1)
        .partitions(3)
        .name(UUID.randomUUID().toString());

    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(topicCreation)
        .exchange()
        .expectStatus()
        .isOk();

    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(topicCreation)
        .exchange()
        .expectStatus()
        .isBadRequest();
  }
}
