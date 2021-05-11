package com.provectus.kafka.ui.steps.kafka;

import lombok.SneakyThrows;
import org.apache.kafka.clients.admin.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class KafkaSteps {

  int partitions = 2;
  short replicationFactor = 1;
  public enum Cluster{
    SECOND_LOCAL("secondLocal","localhost:9093"),LOCAL("local","localhost:9092");
    private String name;
    private String server;
    private  Map<String, Object> config = new HashMap<>();
    Cluster(String name,String server) {
      this.name = name;
      this.server = server;
      this.config.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, server);
      this.config.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
    }

    public String getName() {
      return name;
    }
  }


  @SneakyThrows
  public void createTopic(Cluster cluster,String topicName) {
    try (AdminClient client = AdminClient.create(cluster.config)) {
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
  public void deleteTopic(Cluster cluster,String topicName) {
    try (AdminClient client = AdminClient.create(cluster.config)) {
      assertTrue(client.listTopics().names().get().contains(topicName));
      client
          .deleteTopics(
              Collections.singleton(topicName), new DeleteTopicsOptions().timeoutMs(1000))
          .all()
          .get();
    }
  }
}
