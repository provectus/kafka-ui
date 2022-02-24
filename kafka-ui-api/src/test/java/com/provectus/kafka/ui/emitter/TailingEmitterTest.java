package com.provectus.kafka.ui.emitter;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.MessageFilterTypeDTO;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.SeekTypeDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.MessagesService;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.shaded.org.awaitility.Awaitility;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
class TailingEmitterTest extends AbstractBaseTest {

  @Autowired
  private ApplicationContext ctx;

  private String topic;

  private KafkaProducer<String, String> producer;

  private Disposable tailingFluxDispose;

  @BeforeEach
  void init() {
    topic = "TopicTailingTest_" + UUID.randomUUID();
    createTopic(new NewTopic(topic, 2, (short) 1));
    producer = new KafkaProducer<>(
        Map.of(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class
        ));
  }

  @AfterEach
  void tearDown() {
    deleteTopic(topic);
    if (tailingFluxDispose != null) {
      tailingFluxDispose.dispose();
    }
  }

  @Test
  void allNewMessagesShouldBeEmitted() throws Exception {
    var fluxOutput = startTailing(null);

    List<String> expectedValues = new ArrayList<>();
    for (int i = 0; i < 50; i++) {
      producer.send(new ProducerRecord<>(topic, i + "", i + "")).get();
      expectedValues.add(i + "");
    }

    Awaitility.await()
        .atMost(Duration.ofSeconds(60))
        .pollInSameThread()
        .untilAsserted(() ->
            assertThat(fluxOutput)
              .filteredOn(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
              .extracting(msg -> msg.getMessage().getContent())
              .hasSameElementsAs(expectedValues)
        );
  }

  @Test
  void allNewMessageThatFitFilterConditionShouldBeEmitted() throws Exception {
    var fluxOutput = startTailing("good");

    List<String> expectedValues = new ArrayList<>();
    for (int i = 0; i < 50; i++) {
      if (i % 2 == 0) {
        producer.send(new ProducerRecord<>(topic, i + "", i + "_good")).get();
        expectedValues.add(i + "_good");
      } else {
        producer.send(new ProducerRecord<>(topic, i + "", i + "_bad")).get();
      }
    }

    Awaitility.await()
        .atMost(Duration.ofSeconds(60))
        .pollInSameThread()
        .untilAsserted(() ->
            assertThat(fluxOutput)
              .filteredOn(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
              .extracting(msg -> msg.getMessage().getContent())
              .hasSameElementsAs(expectedValues)
        );
  }

  private Flux<TopicMessageEventDTO> createTailingFlux(
      String topicName,
      String query) {
    var cluster = ctx.getBean(ClustersStorage.class)
        .getClusterByName(LOCAL)
        .get();

    return ctx.getBean(MessagesService.class)
        .loadMessages(cluster, topicName,
            new ConsumerPosition(SeekTypeDTO.LATEST, Map.of(), SeekDirectionDTO.TAILING),
            query,
            MessageFilterTypeDTO.STRING_CONTAINS,
            0);
  }

  private List<TopicMessageEventDTO> startTailing(String filterQuery) {
    List<TopicMessageEventDTO> fluxOutput = new CopyOnWriteArrayList<>();
    tailingFluxDispose = createTailingFlux(topic, filterQuery)
        .doOnNext(fluxOutput::add)
        .subscribe();

    // this is needed to be sure that tailing is initialized
    // and we can start to produce test messages
    waitUntilTailingInitialized(fluxOutput);

    return fluxOutput;
  }


  private void waitUntilTailingInitialized(List<TopicMessageEventDTO> fluxOutput) {
    Awaitility.await()
        .pollInSameThread()
        .pollDelay(Duration.ofMillis(100))
        .atMost(Duration.ofSeconds(10))
        .until(() -> fluxOutput.stream()
            .anyMatch(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.CONSUMING));
  }

}