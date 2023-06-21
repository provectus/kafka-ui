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
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.shaded.org.awaitility.Awaitility;

public class AuditIntegrationTest extends AbstractIntegrationTest {

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
          .atMost(Duration.ofSeconds(15))
          .untilAsserted(() -> {
            var polled = consumer.poll(Duration.ofSeconds(1));
            assertThat(polled).anySatisfy(kafkaRecord -> {
              try {
                AuditRecord record = jsonMapper.readValue(kafkaRecord.value(), AuditRecord.class);
                assertThat(record.operation()).isEqualTo("createTopic");
                assertThat(record.resources()).map(AuditRecord.AuditResource::type).contains(Resource.TOPIC);
                assertThat(record.result().success()).isTrue();
                assertThat(record.timestamp()).isNotBlank();
                assertThat(record.clusterName()).isEqualTo(LOCAL);
                assertThat(record.operationParams())
                    .isEqualTo(Map.of(
                        "name", newTopicName,
                        "partitions", 1,
                        "replicationFactor", 1,
                        "configs", Map.of()
                    ));
              } catch (JsonProcessingException e) {
                Assertions.fail();
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
    props.put(ConsumerConfig.GROUP_ID_CONFIG, AuditIntegrationTest.class.getName());
    return new KafkaConsumer<>(props);
  }

}
