package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

class MessagesServiceTest extends AbstractIntegrationTest {

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
            .loadMessages(cluster, NON_EXISTING_TOPIC, null, null, null, 1, null, "String", "String"))
        .expectError(TopicNotFoundException.class)
        .verify();
  }

}