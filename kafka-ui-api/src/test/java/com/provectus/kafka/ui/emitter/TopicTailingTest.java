package com.provectus.kafka.ui.emitter;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.base.Stopwatch;
import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serde.SimpleRecordSerDe;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;
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
class TopicTailingTest extends AbstractBaseTest {

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
    var fluxOutput = startTailing(m -> true, 100);

    List<String> expectedValues = new ArrayList<>();
    for (int i = 0; i < 50; i++) {
      producer.send(new ProducerRecord<>(topic, i + "", i + "")).get();
      expectedValues.add(i + "");
    }

    Awaitility.await()
        .atMost(Duration.ofSeconds(60))
        .pollInSameThread()
        .untilAsserted(() -> {
          assertThat(fluxOutput)
              .filteredOn(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
              .extracting(msg -> msg.getMessage().getContent())
              .hasSameElementsAs(expectedValues);
        });
  }

  @Test
  void allNewMessageThatFitFilterConditionShouldBeEmitted() throws Exception {
    var fluxOutput =
        startTailing(m -> !m.getMessage().getContent().contains("skip"), 100);

    List<String> expectedValues = new ArrayList<>();
    for (int i = 0; i < 50; i++) {
      if (i % 2 == 0) {
        producer.send(new ProducerRecord<>(topic, i + "", i + "")).get();
        expectedValues.add(i + "");
      } else {
        producer.send(new ProducerRecord<>(topic, i + "", i + "_skip")).get();
      }
    }

    Awaitility.await()
        .atMost(Duration.ofSeconds(60))
        .pollInSameThread()
        .untilAsserted(() -> {
          assertThat(fluxOutput)
              .filteredOn(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
              .extracting(msg -> msg.getMessage().getContent())
              .hasSameElementsAs(expectedValues);
        });
  }

  @Test
  void noThrottlingAppliedWhenProduceRateIsLowerThanThreshold() {
    var fluxOutput = startTailing(m -> true, 20);

    RateLimiter producerLimiter = RateLimiter.create(15);
    for (int i = 0; i < 50; i++) {
      producerLimiter.acquire();
      producer.send(new ProducerRecord<>(topic, i + "", i + ""));
    }

    // waiting until all messages received
    Awaitility.await()
        .atMost(Duration.ofSeconds(60))
        .pollInSameThread()
        .until(() -> fluxOutput.stream()
            .filter(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
            .count() == 50);

    assertThat(fluxOutput)
        .filteredOn(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.EMIT_THROTTLING)
        .isEmpty();
  }

  @Test
  void throttlingAppliedWhenProduceRateIsHigherThatThreshold() {
    int maxEmitRatePerSec = 20;
    int messagesToProduce = maxEmitRatePerSec * 5;

    var fluxOutput = startTailing(m -> true, maxEmitRatePerSec);

    var produceStartWatch = Stopwatch.createStarted();
    RateLimiter producerLimiter = RateLimiter.create(maxEmitRatePerSec * 3);
    for (int i = 0; i < messagesToProduce; i++) {
      producerLimiter.acquire();
      producer.send(new ProducerRecord<>(topic, i + "", i + ""));
    }

    // waiting until all messages received
    Awaitility.await()
        .atMost(Duration.ofSeconds(60))
        .pollInSameThread()
        .until(() -> fluxOutput.stream()
            .filter(msg -> msg.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
            .count() == messagesToProduce);

    assertThat(fluxOutput)
        .filteredOn(evt -> evt.getType() == TopicMessageEventDTO.TypeEnum.EMIT_THROTTLING)
        .hasSize(1);
  }

  private Flux<TopicMessageEventDTO> createTailing(
      String topicName,
      Predicate<TopicMessageEventDTO> msgFilter,
      int maxEmitRecPerSec) {
    var cluster = ctx.getBean(ClustersStorage.class)
        .getClusterByName(LOCAL)
        .get();
    var tailing = new TopicTailing(
        new SimpleRecordSerDe(),
        props -> ctx.getBean(ConsumerGroupService.class).createConsumer(cluster, props),
        msgFilter,
        maxEmitRecPerSec
    );
    return tailing.tail(topicName, Map.of());
  }

  private List<TopicMessageEventDTO> startTailing(Predicate<TopicMessageEventDTO> msgFilter,
                                                  int maxEmitRecPerSec) {
    List<TopicMessageEventDTO> fluxOutput = new CopyOnWriteArrayList<>();
    tailingFluxDispose = createTailing(topic, msgFilter, maxEmitRecPerSec)
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