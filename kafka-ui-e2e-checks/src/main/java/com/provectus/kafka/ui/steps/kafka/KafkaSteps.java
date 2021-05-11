package com.provectus.kafka.ui.steps.kafka;

import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class KafkaSteps {

  private Map<String, Object> conf = new HashMap<>();
  int partitions = 2;
  short replicationFactor = 1;

  public KafkaSteps() {
    conf.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9093");
    conf.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
  }

  @SneakyThrows
  public void createTopic(String topicName) {
    try (AdminClient client = AdminClient.create(conf)) {
      client
          .createTopics(
              Collections.singleton(new NewTopic(topicName, partitions, replicationFactor)),
              new CreateTopicsOptions().timeoutMs(1000))
          .all()
          .get();

      assertTrue(client
              .listTopics()
              .names().get().contains(topicName));

    }
  }

  @SneakyThrows
  public void deleteTopic(String topicName) {
    try (AdminClient client = AdminClient.create(conf)) {
      assertTrue(client.listTopics().names().get().contains(topicName));
      client
          .deleteTopics(
              Collections.singleton(topicName), new DeleteTopicsOptions().timeoutMs(1000))
          .all()
          .get();
    }
  }
}
