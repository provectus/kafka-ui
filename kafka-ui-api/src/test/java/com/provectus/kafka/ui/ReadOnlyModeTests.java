package com.provectus.kafka.ui;

import com.provectus.kafka.ui.model.TopicFormData;
import java.util.Map;
import java.util.UUID;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "60000")
public class ReadOnlyModeTests extends AbstractBaseTest {

  @Autowired
  private WebTestClient webTestClient;

  @Test
  public void shouldCreateTopicForNonReadonlyCluster() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(new TopicFormData()
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
        .bodyValue(new TopicFormData()
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
        .bodyValue(new TopicFormData()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isOk();
    webTestClient.patch()
        .uri("/api/clusters/{clusterName}/topics/{topicName}", LOCAL, topicName)
        .bodyValue(new TopicFormData()
            .name(topicName)
            .partitions(2)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isOk();
  }

  @Test
  public void shouldNotUpdateTopicForReadonlyCluster() {
    var topicName = UUID.randomUUID().toString();
    webTestClient.patch()
        .uri("/api/clusters/{clusterName}/topics/{topicName}", SECOND_LOCAL, topicName)
        .bodyValue(new TopicFormData()
            .name(topicName)
            .partitions(1)
            .replicationFactor(1)
            .configs(Map.of())
        )
        .exchange()
        .expectStatus()
        .isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
  }
}
