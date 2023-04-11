package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.MessagesService.execSmartFilterTest;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.SeekTypeDTO;
import com.provectus.kafka.ui.model.SmartFilterTestExecutionDTO;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import java.util.List;
import java.util.Map;
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
            .loadMessages(cluster, NON_EXISTING_TOPIC, null, null, null, 1, null, "String", "String"))
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

      Flux<TopicMessageDTO> msgsFlux = messagesService.loadMessages(
          cluster,
          testTopic,
          new ConsumerPosition(SeekTypeDTO.BEGINNING, testTopic, null),
          null,
          null,
          100,
          SeekDirectionDTO.FORWARD,
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

  @Test
  void execSmartFilterTestReturnsExecutionResult() {
    var params = new SmartFilterTestExecutionDTO()
        .filterCode("key != null && value != null && headers != null && timestampMs != null && offset != null")
        .key("1234")
        .value("{ \"some\" : \"value\" } ")
        .headers(Map.of("h1", "hv1"))
        .offset(12345L)
        .timestampMs(System.currentTimeMillis())
        .partition(1);
    assertThat(execSmartFilterTest(params).getResult()).isTrue();

    params.setFilterCode("return false");
    assertThat(execSmartFilterTest(params).getResult()).isFalse();
  }

  @Test
  void execSmartFilterTestReturnsErrorOnFilterApplyError() {
    var result = execSmartFilterTest(
        new SmartFilterTestExecutionDTO()
            .filterCode("return 1/0")
    );
    assertThat(result.getResult()).isNull();
    assertThat(result.getError()).containsIgnoringCase("execution error");
  }

  @Test
  void execSmartFilterTestReturnsErrorOnFilterCompilationError() {
    var result = execSmartFilterTest(
        new SmartFilterTestExecutionDTO()
            .filterCode("this is invalid groovy syntax = 1")
    );
    assertThat(result.getResult()).isNull();
    assertThat(result.getError()).containsIgnoringCase("Compilation error");
  }

}
