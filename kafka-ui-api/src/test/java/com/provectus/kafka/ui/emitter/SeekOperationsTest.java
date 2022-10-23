package com.provectus.kafka.ui.emitter;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.SeekTypeDTO;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.kafka.clients.consumer.MockConsumer;
import org.apache.kafka.clients.consumer.OffsetResetStrategy;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class SeekOperationsTest {

  final String topic = "test";
  final TopicPartition tp0 = new TopicPartition(topic, 0); //offsets: start 0, end 0
  final TopicPartition tp1 = new TopicPartition(topic, 1); //offsets: start 10, end 10
  final TopicPartition tp2 = new TopicPartition(topic, 2); //offsets: start 0, end 20
  final TopicPartition tp3 = new TopicPartition(topic, 3); //offsets: start 25, end 30

  MockConsumer<Bytes, Bytes> consumer;

  @BeforeEach
  void initMockConsumer() {
    consumer = new MockConsumer<>(OffsetResetStrategy.EARLIEST);
    consumer.updatePartitions(
        topic,
        Stream.of(tp0, tp1, tp2, tp3)
            .map(tp -> new PartitionInfo(topic, tp.partition(), null, null, null, null))
            .collect(Collectors.toList()));
    consumer.updateBeginningOffsets(Map.of(tp0, 0L, tp1, 10L, tp2, 0L, tp3, 25L));
    consumer.updateEndOffsets(Map.of(tp0, 0L, tp1, 10L, tp2, 20L, tp3, 30L));
  }

  @Nested
  class GetOffsetsForSeek {

    @Test
    void latest() {
      var offsets = SeekOperations.getOffsetsForSeek(
          consumer,
          new OffsetsInfo(consumer, topic),
          SeekTypeDTO.LATEST,
          null
      );
      assertThat(offsets).containsExactlyInAnyOrderEntriesOf(Map.of(tp2, 20L, tp3, 30L));
    }

    @Test
    void beginning() {
      var offsets = SeekOperations.getOffsetsForSeek(
          consumer,
          new OffsetsInfo(consumer, topic),
          SeekTypeDTO.BEGINNING,
          null
      );
      assertThat(offsets).containsExactlyInAnyOrderEntriesOf(Map.of(tp2, 0L, tp3, 25L));
    }

    @Test
    void offsets() {
      var offsets = SeekOperations.getOffsetsForSeek(
          consumer,
          new OffsetsInfo(consumer, topic),
          SeekTypeDTO.OFFSET,
          Map.of(tp1, 10L, tp2, 10L, tp3, 26L)
      );
      assertThat(offsets).containsExactlyInAnyOrderEntriesOf(Map.of(tp2, 10L, tp3, 26L));
    }

    @Test
    void offsetsWithBoundsFixing() {
      var offsets = SeekOperations.getOffsetsForSeek(
          consumer,
          new OffsetsInfo(consumer, topic),
          SeekTypeDTO.OFFSET,
          Map.of(tp1, 10L, tp2, 21L, tp3, 24L)
      );
      assertThat(offsets).containsExactlyInAnyOrderEntriesOf(Map.of(tp2, 20L, tp3, 25L));
    }
  }

}