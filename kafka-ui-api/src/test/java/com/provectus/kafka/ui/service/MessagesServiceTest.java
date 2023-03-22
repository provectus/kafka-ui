package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PollingModeDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import java.util.List;
import java.util.UUID;
import org.apache.kafka.clients.admin.NewTopic;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

class MessagesServiceTest extends AbstractIntegrationTest {

  private static final String MASKED_TOPICS_PREFIX = "masking-test-";
  private static final String NON_EXISTING_TOPIC = UUID.randomUUID().toString();

  @Autowired
  MessagesService messagesService;

  KafkaCluster cluster;

  @BeforeEach
  void init() {
    cluster = applicationContext
        .getBean(ClustersStorage.class)
        .getClusterByName(LOCAL)
        .get();
  }

  @Test
  void deleteTopicMessagesReturnsExceptionWhenTopicNotFound() {
    StepVerifier.create(messagesService.deleteTopicMessages(cluster, NON_EXISTING_TOPIC, List.of()))
        .expectError(TopicNotFoundException.class)
        .verify();
  }

  @Test
  void sendMessageReturnsExceptionWhenTopicNotFound() {
    StepVerifier.create(messagesService.sendMessage(cluster, NON_EXISTING_TOPIC, new CreateTopicMessageDTO()))
        .expectError(TopicNotFoundException.class)
        .verify();
  }

  @Test
  void loadMessagesReturnsExceptionWhenTopicNotFound() {
    StepVerifier.create(messagesService
            .loadMessagesV2(cluster, NON_EXISTING_TOPIC,
                new ConsumerPosition(PollingModeDTO.TAILING, NON_EXISTING_TOPIC, List.of(), null, null),
                null, null, 1, "String", "String"))
        .expectError(TopicNotFoundException.class)
        .verify();
  }

  @Test
  void maskingAppliedOnConfiguredClusters() throws Exception {
    String testTopic = MASKED_TOPICS_PREFIX + UUID.randomUUID();
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      createTopic(new NewTopic(testTopic, 1, (short) 1));
      producer.send(testTopic, "message1");
      producer.send(testTopic, "message2").get();

      Flux<TopicMessageDTO> msgsFlux = messagesService.loadMessagesV2(
          cluster,
          testTopic,
          new ConsumerPosition(PollingModeDTO.EARLIEST, testTopic, List.of(), null, null),
          null,
          null,
          100,
          StringSerde.name(),
          StringSerde.name()
      ).filter(evt -> evt.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
          .map(TopicMessageEventDTO::getMessage);

      // both messages should be masked
      StepVerifier.create(msgsFlux)
          .expectNextMatches(msg -> msg.getContent().equals("***"))
          .expectNextMatches(msg -> msg.getContent().equals("***"))
          .verifyComplete();
    } finally {
      deleteTopic(testTopic);
    }
  }

}
