package com.provectus.kafka.ui.service.audit;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.rbac.Resource;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.shaded.org.awaitility.Awaitility;

public class KafkaAuditTest extends AbstractIntegrationTest {

  @Autowired
  private WebTestClient webTestClient;

  @Test
  void auditRecordWrittenIntoKafkaWhenNewTopicCreated() {
    String newTopicName = "test_audit_" + UUID.randomUUID();

    webTestClient.post()
        .uri("/api/clusters/{clusterName}/topics", LOCAL)
        .bodyValue(
            new TopicCreationDTO()
                .replicationFactor(1)
                .partitions(1)
                .name(newTopicName)
        )
        .exchange()
        .expectStatus()
        .isOk();

    try (var consumer = createConsumer()) {
      var jsonMapper = new JsonMapper();
      consumer.subscribe(List.of("__kui-audit-log"));
      Awaitility.await()
          .pollInSameThread()
          .atMost(Duration.ofSeconds(10))
          .untilAsserted(() -> {
            var polled = consumer.poll(Duration.ofSeconds(1));
            assertThat(polled).anyMatch(rec -> {
              try {
                AuditRecord record = jsonMapper.readValue(rec.value(), AuditRecord.class);
                return Map.of(
                    "name", newTopicName,
                    "partitions", 1,
                    "replicationFactor", 1,
                    "configs", Map.of()
                ).equals(record.operationParams())
                    && "createTopic".equals(record.operation())
                    && record.resources().stream().anyMatch(r -> r.type() == Resource.TOPIC)
                    && record.result().success();
              } catch (JsonProcessingException e) {
                return false;
              }
            });
          });
    }
  }

  private KafkaConsumer<?, String> createConsumer() {
    Properties props = new Properties();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.put(ConsumerConfig.GROUP_ID_CONFIG, KafkaAuditTest.class.getName());
    return new KafkaConsumer<>(props);
  }

}
