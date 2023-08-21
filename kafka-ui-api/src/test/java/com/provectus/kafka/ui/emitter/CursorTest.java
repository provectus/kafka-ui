package com.provectus.kafka.ui.emitter;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractIntegrationTest;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.PollingModeDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.serde.api.Serde;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.serdes.PropertyResolverImpl;
import com.provectus.kafka.ui.serdes.builtin.StringSerde;
import com.provectus.kafka.ui.service.PollingCursorsStorage;
import com.provectus.kafka.ui.util.ApplicationMetrics;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.function.Consumer;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

class CursorTest extends AbstractIntegrationTest {

  static final String TOPIC = CursorTest.class.getSimpleName() + "_" + UUID.randomUUID();
  static final int MSGS_IN_PARTITION = 20;
  static final int PAGE_SIZE = (MSGS_IN_PARTITION / 2) + 1; //to poll fill data set in 2 iterations

  final PollingCursorsStorage cursorsStorage = new PollingCursorsStorage();

  @BeforeAll
  static void setup() {
    createTopic(new NewTopic(TOPIC, 1, (short) 1));
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int i = 0; i < MSGS_IN_PARTITION; i++) {
        producer.send(new ProducerRecord<>(TOPIC, "msg_" + i));
      }
    }
  }

  @AfterAll
  static void cleanup() {
    deleteTopic(TOPIC);
  }

  @Test
  void backwardEmitter() {
    var consumerPosition = new ConsumerPosition(PollingModeDTO.LATEST, TOPIC, List.of(), null, null);
    var emitter = createBackwardEmitter(consumerPosition);
    emitMessages(emitter, PAGE_SIZE);
    var cursor = assertCursor(
        PollingModeDTO.TO_OFFSET,
        offsets -> assertThat(offsets)
            .hasSize(1)
            .containsEntry(new TopicPartition(TOPIC, 0), 9L)
    );

    // polling remaining records using registered cursor
    emitter = createBackwardEmitterWithCursor(cursor);
    emitMessages(emitter, MSGS_IN_PARTITION - PAGE_SIZE);
    //checking no new cursors registered
    assertThat(cursorsStorage.asMap()).hasSize(1).containsValue(cursor);
  }

  @Test
  void forwardEmitter() {
    var consumerPosition = new ConsumerPosition(PollingModeDTO.EARLIEST, TOPIC, List.of(), null, null);
    var emitter = createForwardEmitter(consumerPosition);
    emitMessages(emitter, PAGE_SIZE);
    var cursor = assertCursor(
        PollingModeDTO.FROM_OFFSET,
        offsets -> assertThat(offsets)
            .hasSize(1)
            .containsEntry(new TopicPartition(TOPIC, 0), 11L)
    );

    //polling remaining records using registered cursor
    emitter = createForwardEmitterWithCursor(cursor);
    emitMessages(emitter, MSGS_IN_PARTITION - PAGE_SIZE);
    //checking no new cursors registered
    assertThat(cursorsStorage.asMap()).hasSize(1).containsValue(cursor);
  }

  private Cursor assertCursor(PollingModeDTO expectedMode,
                              Consumer<Map<TopicPartition, Long>> offsetsAssert) {
    Cursor registeredCursor = cursorsStorage.asMap().values().stream().findFirst().orElse(null);
    assertThat(registeredCursor).isNotNull();
    assertThat(registeredCursor.limit()).isEqualTo(PAGE_SIZE);
    assertThat(registeredCursor.deserializer()).isNotNull();
    assertThat(registeredCursor.filter()).isNotNull();

    var cursorPosition = registeredCursor.consumerPosition();
    assertThat(cursorPosition).isNotNull();
    assertThat(cursorPosition.topic()).isEqualTo(TOPIC);
    assertThat(cursorPosition.partitions()).isEqualTo(List.of());
    assertThat(cursorPosition.pollingMode()).isEqualTo(expectedMode);

    offsetsAssert.accept(cursorPosition.offsets().tpOffsets());
    return registeredCursor;
  }

  private void emitMessages(AbstractEmitter emitter, int expectedCnt) {
    StepVerifier.create(
            Flux.create(emitter)
                .filter(e -> e.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
                .map(e -> e.getMessage().getContent())
        )
        .expectNextCount(expectedCnt)
        .verifyComplete();
  }

  private BackwardEmitter createBackwardEmitter(ConsumerPosition position) {
    return new BackwardEmitter(
        this::createConsumer,
        position,
        PAGE_SIZE,
        createRecordsDeserializer(),
        m -> true,
        PollingSettings.createDefault(),
        createCursor(position)
    );
  }

  private BackwardEmitter createBackwardEmitterWithCursor(Cursor cursor) {
    return new BackwardEmitter(
        this::createConsumer,
        cursor.consumerPosition(),
        cursor.limit(),
        cursor.deserializer(),
        cursor.filter(),
        PollingSettings.createDefault(),
        createCursor(cursor.consumerPosition())
    );
  }

  private ForwardEmitter createForwardEmitterWithCursor(Cursor cursor) {
    return new ForwardEmitter(
        this::createConsumer,
        cursor.consumerPosition(),
        cursor.limit(),
        cursor.deserializer(),
        cursor.filter(),
        PollingSettings.createDefault(),
        createCursor(cursor.consumerPosition())
    );
  }

  private ForwardEmitter createForwardEmitter(ConsumerPosition position) {
    return new ForwardEmitter(
        this::createConsumer,
        position,
        PAGE_SIZE,
        createRecordsDeserializer(),
        m -> true,
        PollingSettings.createDefault(),
        createCursor(position)
    );
  }

  private Cursor.Tracking createCursor(ConsumerPosition position) {
    return cursorsStorage.createNewCursor(createRecordsDeserializer(), position, m -> true, PAGE_SIZE);
  }

  private EnhancedConsumer createConsumer() {
    Properties props = new Properties();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
    props.put(ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString());
    props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, PAGE_SIZE - 1); // to check multiple polls
    return new EnhancedConsumer(props, PollingThrottler.noop(), ApplicationMetrics.noop());
  }

  private static ConsumerRecordDeserializer createRecordsDeserializer() {
    Serde s = new StringSerde();
    s.configure(PropertyResolverImpl.empty(), PropertyResolverImpl.empty(), PropertyResolverImpl.empty());
    return new ConsumerRecordDeserializer(
        StringSerde.name(),
        s.deserializer(null, Serde.Target.KEY),
        StringSerde.name(),
        s.deserializer(null, Serde.Target.VALUE),
        StringSerde.name(),
        s.deserializer(null, Serde.Target.KEY),
        s.deserializer(null, Serde.Target.VALUE),
        msg -> msg
    );
  }

}
