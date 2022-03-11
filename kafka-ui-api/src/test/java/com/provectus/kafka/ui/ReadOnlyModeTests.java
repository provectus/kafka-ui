package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.TopicUpdateDTO;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;

public class ReadOnlyModeTests extends AbstractIntegrationTest {

  @Autowired
  private WebTestClient webTestClient;

  @Test
  public void shouldCreateTopicForNonReadonlyCluster() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(new TopicCreationDTO()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isOk();
  }

  @Test
  public void shouldNotCreateTopicForReadonlyCluster() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", SECOND_LOCAL)
        .bodyValue(new TopicCreationDTO()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
  }

  @Test
  public void shouldUpdateTopicForNonReadonlyCluster() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(new TopicCreationDTO()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
        )
        .exchange()
        .expectStatus()
        .isOk();

    webTestClient.patch()
        .uri("/api/clusters/{clusterName}/topics/{topicName}", LOCAL, topicName)
        .bodyValue(new TopicUpdateDTO()
            .configs(Map.of("cleanup.policy", "compact"))
        )
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody()
        .jsonPath("$.cleanUpPolicy").isEqualTo("COMPACT");
  }

  @Test
  public void shouldNotUpdateTopicForReadonlyCluster() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.patch()
        .uri("/api/clusters/{clusterName}/topics/{topicName}", SECOND_LOCAL, topicName)
        .bodyValue(new TopicUpdateDTO()
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
  }
}
