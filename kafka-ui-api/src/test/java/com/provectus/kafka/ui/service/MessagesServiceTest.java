package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.MessagesService.execSmartFilterTest;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PollingModeDTO;
import com.provectus.kafka.ui.model.SmartFilterTestExecutionDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.apache.kafka.clients.admin.NewTopic;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

class MessagesServiceTest extends AbstractIntegrationTest {

  private static final String MASKED_TOPICS_PREFIX = "masking-test-";
  private static final String NON_EXISTING_TOPIC = UUID.randomUUID().toString();

  @Autowired
  MessagesService messagesService;

  KafkaCluster cluster;

  Set<String> createdTopics = new HashSet<>();

  @BeforeEach
  void init() {
    cluster = applicationContext
        .getBean(ClustersStorage.class)
        .getClusterByName(LOCAL)
        .get();
  }

  @AfterEach
  void deleteCreatedTopics() {
    createdTopics.forEach(MessagesServiceTest::deleteTopic);
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
            .loadMessages(cluster, NON_EXISTING_TOPIC,
                new ConsumerPosition(PollingModeDTO.TAILING, NON_EXISTING_TOPIC, List.of(), null, null),
                null, null, 1, "String", "String"))
        .expectError(TopicNotFoundException.class)
        .verify();
  }

  @Test
  void maskingAppliedOnConfiguredClusters() throws Exception {
    String testTopic = MASKED_TOPICS_PREFIX + UUID.randomUUID();
    createTopicWithCleanup(new NewTopic(testTopic, 1, (short) 1));

    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      producer.send(testTopic, "message1");
      producer.send(testTopic, "message2").get();
    }

    Flux<TopicMessageDTO> msgsFlux = messagesService.loadMessages(
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
  }

  @ParameterizedTest
  @CsvSource({"EARLIEST", "LATEST"})
  void cursorIsRegisteredAfterPollingIsDoneAndCanBeUsedForNextPagePolling(PollingModeDTO mode) {
    String testTopic = MessagesServiceTest.class.getSimpleName() + UUID.randomUUID();
    createTopicWithCleanup(new NewTopic(testTopic, 5, (short) 1));

    int msgsToGenerate = 100;
    int pageSize = (msgsToGenerate / 2) + 1;

    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int i = 0; i < msgsToGenerate; i++) {
        producer.send(testTopic, "message_" + i);
      }
    }

    var cursorIdCatcher = new AtomicReference<String>();
    Flux<String> msgsFlux = messagesService.loadMessages(
            cluster, testTopic,
            new ConsumerPosition(mode, testTopic, List.of(), null, null),
            null, null, pageSize, StringSerde.name(), StringSerde.name())
        .doOnNext(evt -> {
          if (evt.getType() == TopicMessageEventDTO.TypeEnum.DONE) {
            assertThat(evt.getCursor()).isNotNull();
            cursorIdCatcher.set(evt.getCursor().getId());
          }
        })
        .filter(evt -> evt.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
        .map(evt -> evt.getMessage().getContent());

    StepVerifier.create(msgsFlux)
        .expectNextCount(pageSize)
        .verifyComplete();

    assertThat(cursorIdCatcher.get()).isNotNull();

    Flux<String> remainingMsgs = messagesService.loadMessages(cluster, testTopic, cursorIdCatcher.get())
        .doOnNext(evt -> {
          if (evt.getType() == TopicMessageEventDTO.TypeEnum.DONE) {
            assertThat(evt.getCursor()).isNull();
          }
        })
        .filter(evt -> evt.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
        .map(evt -> evt.getMessage().getContent());

    StepVerifier.create(remainingMsgs)
        .expectNextCount(msgsToGenerate - pageSize)
        .verifyComplete();
  }

  private void createTopicWithCleanup(NewTopic newTopic) {
    createTopic(newTopic);
    createdTopics.add(newTopic.name());
  }

}
