package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.emitter.BackwardRecordEmitter;
import com.provectus.kafka.ui.emitter.ForwardRecordEmitter;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekDirection;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import com.provectus.kafka.ui.util.OffsetsSeekBackward;
import com.provectus.kafka.ui.util.OffsetsSeekForward;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import lombok.Value;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

@Log4j2
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
          SENT_RECORDS.add(new Record(
              value,
              new TopicPartition(metadata.topic(), metadata.partition()),
              metadata.offset(),
              ts)
          );
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
    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekForward(EMPTY_TOPIC,
            new ConsumerPosition(SeekType.BEGINNING, Map.of(), SeekDirection.FORWARD)
        )
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(
            EMPTY_TOPIC,
            new ConsumerPosition(SeekType.BEGINNING, Map.of(), SeekDirection.BACKWARD),
            100
        )
    );

    Long polledValues = Flux.create(forwardEmitter)
        .limitRequest(100)
        .count()
        .block();

    assertThat(polledValues).isZero();

    polledValues = Flux.create(backwardEmitter)
        .limitRequest(100)
        .count()
        .block();

    assertThat(polledValues).isZero();

  }

  @Test
  void pollFullTopicFromBeginning() {
    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekForward(TOPIC,
            new ConsumerPosition(SeekType.BEGINNING, Map.of(), SeekDirection.FORWARD)
        )
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(SeekType.BEGINNING, Map.of(), SeekDirection.FORWARD),
            PARTITIONS * MSGS_PER_PARTITION
        )
    );

    var polledValues = Flux.create(forwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(
        SENT_RECORDS.stream().map(Record::getValue).collect(Collectors.toList()));

    polledValues = Flux.create(backwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(
        SENT_RECORDS.stream().map(Record::getValue).collect(Collectors.toList()));

  }

  @Test
  void pollWithOffsets() {
    Map<TopicPartition, Long> targetOffsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      long offset = ThreadLocalRandom.current().nextLong(MSGS_PER_PARTITION);
      targetOffsets.put(new TopicPartition(TOPIC, i), offset);
    }

    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekForward(TOPIC,
            new ConsumerPosition(SeekType.OFFSET, targetOffsets, SeekDirection.FORWARD)
        )
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(SeekType.OFFSET, targetOffsets, SeekDirection.BACKWARD),
            PARTITIONS * MSGS_PER_PARTITION
        )
    );

    var polledValues = Flux.create(forwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() >= targetOffsets.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);

    expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() < targetOffsets.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    polledValues =  Flux.create(backwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);
  }

  @Test
  void pollWithTimestamps() {
    Map<TopicPartition, Long> targetTimestamps = new HashMap<>();
    final Map<TopicPartition, List<Record>> perPartition =
        SENT_RECORDS.stream().collect(Collectors.groupingBy((r) -> r.tp));
    for (int i = 0; i < PARTITIONS; i++) {
      final List<Record> records = perPartition.get(new TopicPartition(TOPIC, i));
      int randRecordIdx = ThreadLocalRandom.current().nextInt(records.size());
      log.info("partition: {} position: {}", i, randRecordIdx);
      targetTimestamps.put(
          new TopicPartition(TOPIC, i),
          records.get(randRecordIdx).getTimestamp()
      );
    }

    var forwardEmitter = new ForwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekForward(TOPIC,
            new ConsumerPosition(SeekType.TIMESTAMP, targetTimestamps, SeekDirection.FORWARD)
        )
    );

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(SeekType.TIMESTAMP, targetTimestamps, SeekDirection.BACKWARD),
            PARTITIONS * MSGS_PER_PARTITION
        )
    );

    var polledValues = Flux.create(forwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getTimestamp() >= targetTimestamps.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);

    polledValues = Flux.create(backwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getTimestamp() < targetTimestamps.get(r.getTp()))
        .map(Record::getValue)
        .collect(Collectors.toList());

    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);

  }

  @Test
  void backwardEmitterSeekToEnd() {
    final int numMessages = 100;
    final Map<TopicPartition, Long> targetOffsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      targetOffsets.put(new TopicPartition(TOPIC, i), (long) MSGS_PER_PARTITION);
    }

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(SeekType.OFFSET, targetOffsets, SeekDirection.BACKWARD),
            numMessages
        )
    );

    var polledValues = Flux.create(backwardEmitter)
        .map(this::deserialize)
        .limitRequest(numMessages)
        .collect(Collectors.toList())
        .block();

    var expectedValues = SENT_RECORDS.stream()
        .filter(r -> r.getOffset() < targetOffsets.get(r.getTp()))
        .filter(r -> r.getOffset() >= (targetOffsets.get(r.getTp()) - (100 / PARTITIONS)))
        .map(Record::getValue)
        .collect(Collectors.toList());


    assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);
  }

  @Test
  void backwardEmitterSeekToBegin() {
    Map<TopicPartition, Long> offsets = new HashMap<>();
    for (int i = 0; i < PARTITIONS; i++) {
      offsets.put(new TopicPartition(TOPIC, i), 0L);
    }

    var backwardEmitter = new BackwardRecordEmitter(
        this::createConsumer,
        new OffsetsSeekBackward(TOPIC,
            new ConsumerPosition(SeekType.OFFSET, offsets, SeekDirection.BACKWARD),
            100
        )
    );

    var polledValues = Flux.create(backwardEmitter)
        .map(this::deserialize)
        .limitRequest(Long.MAX_VALUE)
        .collect(Collectors.toList())
        .block();

    assertThat(polledValues).isEmpty();
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer() {
    return createConsumer(Map.of());
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer(Map<String, Object> properties) {
    final Map<String, ? extends Serializable> map = Map.of(
        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
        ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString(),
        ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 20, // to check multiple polls
        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class,
        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class
    );
    Properties props = new Properties();
    props.putAll(map);
    props.putAll(properties);
    return new KafkaConsumer<>(props);
  }

  private String deserialize(ConsumerRecord<Bytes, Bytes> rec) {
    return new StringDeserializer().deserialize(TOPIC, rec.value().get());
  }

  @Value
  static class Record {
    String value;
    TopicPartition tp;
    long offset;
    long timestamp;
  }
}
