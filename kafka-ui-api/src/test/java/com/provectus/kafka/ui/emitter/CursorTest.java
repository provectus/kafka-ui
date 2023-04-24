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
import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.function.Consumer;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;


public class CursorTest extends AbstractIntegrationTest {

  static final String TOPIC = CursorTest.class.getSimpleName() + "_" + UUID.randomUUID();

  static final int MSGS_IN_PARTITION = 20;
  static final int PAGE_SIZE = 11;

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
    var cursorsStorage = new PollingCursorsStorage();
    var consumerPosition = new ConsumerPosition(PollingModeDTO.LATEST, TOPIC, List.of(), null, null);

    var cursor = new Cursor.Tracking(
        createRecordsDeserializer(),
        consumerPosition,
        m -> true,
        PAGE_SIZE,
        cursorsStorage::register
    );

    var emitter = createBackwardEmitter(consumerPosition, cursor);
    verifyMessagesEmitted(emitter);
    assertCursor(
        cursorsStorage,
        PollingModeDTO.TO_OFFSET,
        offsets -> assertThat(offsets)
            .hasSize(1)
            .containsEntry(new TopicPartition(TOPIC, 0), 9L)
    );
  }

  @Test
  void forwardEmitter() {
    var cursorsStorage = new PollingCursorsStorage();
    var consumerPosition = new ConsumerPosition(PollingModeDTO.EARLIEST, TOPIC, List.of(), null, null);

    var cursor = new Cursor.Tracking(
        createRecordsDeserializer(),
        consumerPosition,
        m -> true,
        PAGE_SIZE,
        cursorsStorage::register
    );

    var emitter = createForwardEmitter(consumerPosition, cursor);
    verifyMessagesEmitted(emitter);
    assertCursor(
        cursorsStorage,
        PollingModeDTO.FROM_OFFSET,
        offsets -> assertThat(offsets)
            .hasSize(1)
            .containsEntry(new TopicPartition(TOPIC, 0), 11L)
    );
  }

  private void assertCursor(PollingCursorsStorage storage,
                            PollingModeDTO expectedMode,
                            Consumer<Map<TopicPartition, Long>> offsetsAssert) {
    Cursor registeredCursor = storage.asMap().values().stream().findFirst().orElse(null);
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
  }

  private void verifyMessagesEmitted(AbstractEmitter emitter) {
    StepVerifier.create(
            Flux.create(emitter)
                .filter(e -> e.getType() == TopicMessageEventDTO.TypeEnum.MESSAGE)
                .map(e -> e.getMessage().getContent())
        )
        .expectNextCount(PAGE_SIZE)
        .verifyComplete();
  }

  private BackwardRecordEmitter createBackwardEmitter(ConsumerPosition position, Cursor.Tracking cursor) {
    return new BackwardRecordEmitter(
        this::createConsumer,
        position,
        PAGE_SIZE,
        new MessagesProcessing(createRecordsDeserializer(), m -> true, PAGE_SIZE),
        PollingSettings.createDefault(),
        cursor
    );
  }

  private ForwardRecordEmitter createForwardEmitter(ConsumerPosition position, Cursor.Tracking cursor) {
    return new ForwardRecordEmitter(
        this::createConsumer,
        position,
        new MessagesProcessing(createRecordsDeserializer(), m -> true, PAGE_SIZE),
        PollingSettings.createDefault(),
        cursor
    );
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer() {
    final Map<String, ? extends Serializable> map = Map.of(
        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
        ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString(),
        ConsumerConfig.MAX_POLL_RECORDS_CONFIG, PAGE_SIZE - 1, // to check multiple polls
        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class,
        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class
    );
    Properties props = new Properties();
    props.putAll(map);
    return new KafkaConsumer<>(props);
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
        s.deserializer(null, Serde.Target.VALUE)
    );
  }

}
