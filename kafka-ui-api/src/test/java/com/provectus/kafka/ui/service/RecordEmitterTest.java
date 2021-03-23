package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.service.ConsumingService.OffsetsSeek;
import static com.provectus.kafka.ui.service.ConsumingService.RecordEmitter;
import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import lombok.Value;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

class RecordEmitterTest extends AbstractBaseTest {

  static final int PARTITIONS = 5;
  static final int MSGS_PER_PARTITION = 100;

  static final String TOPIC = RecordEmitterTest.class.getSimpleName() + "_" + UUID.randomUUID();
  static final String EMPTY_TOPIC = TOPIC + "_empty";
  static final List<Record> SENT_RECORDS = new ArrayList<>();

  @BeforeAll
  static void generateMsgs() throws Exception {
    createTopic(new NewTopic(TOPIC, PARTITIONS, (short) 1));
    createTopic(new NewTopic(EMPTY_TOPIC, PARTITIONS, (short) 1));
    try (var producer = KafkaTestProducer.forKafka(kafka)) {
      for (int partition = 0; partition < PARTITIONS; partition++) {
        for (int i = 0; i < MSGS_PER_PARTITION; i++) {
          long ts = System.currentTimeMillis() + i;
          var value = "msg_" + partition + "_" + i;
          var metadata =
              producer.send(new ProducerRecord<>(TOPIC, partition, ts, null, value)).get();
          SENT_RECORDS.add(new Record(value, metadata.partition(), metadata.offset(), ts));
        }
      }
    }
  }

  @AfterAll
  static void cleanup() {
    deleteTopic(TOPIC);
    deleteTopic(EMPTY_TOPIC);
  }

  @Test
  void pollNothingOnEmptyTopic() {
    var emitter = new RecordEmitter(
        this::createConsumer,
        new OffsetsSeek(EMPTY_TOPIC, new ConsumerPosition(SeekType.BEGINNING, Map.of())));

    Long polledValues = Flux.create(emitter)
        .limitRequest(100)
        .count()
        .block();

    assertThat(polledValues).isZero();
  }

  @Test
  void pollFullTopicFromBeginning() {
    var emitter = new RecordEmitter(
        this::createConsumer,
        new OffsetsSeek(TOPIC, new ConsumerPosition(SeekType.BEGINNING, Map.of())));

    var polledValues = Flux.create(emitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(
        SENT_RECORDS.stream().map(Record::getValue).collect(Collectors.toList()));
  }

  @Test
  void pollWithOffsets() {
    Map<Integer, Long> targetOffsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      long offset = ThreadLocalRandom.current().nextLong(MSGS_PER_PARTITION);
      targetOffsets.put(i, offset);
    }

    var emitter = new RecordEmitter(
        this::createConsumer,
        new OffsetsSeek(TOPIC, new ConsumerPosition(SeekType.OFFSET, targetOffsets)));

    var polledValues = Flux.create(emitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() >= targetOffsets.get(r.getPartition()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);
  }

  @Test
  void pollWithTimestamps() {
    Map<Integer, Long> targetTimestamps = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      int randRecordIdx = ThreadLocalRandom.current().nextInt(SENT_RECORDS.size());
      targetTimestamps.put(i, SENT_RECORDS.get(randRecordIdx).getTimestamp());
    }

    var emitter = new RecordEmitter(
        this::createConsumer,
        new OffsetsSeek(TOPIC, new ConsumerPosition(SeekType.TIMESTAMP, targetTimestamps)));

    var polledValues = Flux.create(emitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getTimestamp() >= targetTimestamps.get(r.getPartition()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer() {
    return new KafkaConsumer<>(
        Map.of(
            ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
            ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString(),
            ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 20, // to check multiple polls
            ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class,
            ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class
        )
    );
  }

  private String deserialize(ConsumerRecord<Bytes, Bytes> rec) {
    return new StringDeserializer().deserialize(TOPIC, rec.value().get());
  }

  @Value
  static class Record {
    String value;
    int partition;
    long offset;
    long timestamp;
  }
}
