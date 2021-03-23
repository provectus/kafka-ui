package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekType;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.MockConsumer;
import org.apache.kafka.clients.consumer.OffsetResetStrategy;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class OffsetsSeekTest {

  String topic = "test";
  TopicPartition tp0 = new TopicPartition(topic, 0); //offsets: start 0, end 0
  TopicPartition tp1 = new TopicPartition(topic, 1); //offsets: start 10, end 10
  TopicPartition tp2 = new TopicPartition(topic, 2); //offsets: start 0, end 20
  TopicPartition tp3 = new TopicPartition(topic, 3); //offsets: start 25, end 30

  MockConsumer<Bytes, Bytes> consumer = new MockConsumer<>(OffsetResetStrategy.EARLIEST);

  @BeforeEach
  void initConsumer() {
    consumer = new MockConsumer<>(OffsetResetStrategy.EARLIEST);
    consumer.updatePartitions(
        topic,
        Stream.of(tp0, tp1, tp2, tp3)
            .map(tp -> new PartitionInfo(topic, tp.partition(), null, null, null, null))
            .collect(Collectors.toList()));
    consumer.updateBeginningOffsets(Map.of(
        tp0, 0L,
        tp1, 10L,
        tp2, 0L,
        tp3, 25L
    ));
    consumer.addEndOffsets(Map.of(
        tp0, 0L,
        tp1, 10L,
        tp2, 20L,
        tp3, 30L
    ));
  }

  @Test
  void seekToBeginningAllPartitions() {
    var seek = new ConsumingService.OffsetsSeek(
        topic,
        new ConsumerPosition(SeekType.BEGINNING, Map.of(0, 0L, 1, 0L)));
    seek.assignAndSeek(consumer);
    assertThat(consumer.assignment()).containsExactlyInAnyOrder(tp0, tp1);
    assertThat(consumer.position(tp0)).isEqualTo(0L);
    assertThat(consumer.position(tp1)).isEqualTo(10L);
  }

  @Test
  void seekToBeginningWithPartitionsList() {
    var seek = new ConsumingService.OffsetsSeek(
        topic,
        new ConsumerPosition(SeekType.BEGINNING, Map.of()));
    seek.assignAndSeek(consumer);
    assertThat(consumer.assignment()).containsExactlyInAnyOrder(tp0, tp1, tp2, tp3);
    assertThat(consumer.position(tp0)).isEqualTo(0L);
    assertThat(consumer.position(tp1)).isEqualTo(10L);
    assertThat(consumer.position(tp2)).isEqualTo(0L);
    assertThat(consumer.position(tp3)).isEqualTo(25L);
  }

  @Test
  void seekToOffset() {
    var seek = new ConsumingService.OffsetsSeek(
        topic,
        new ConsumerPosition(SeekType.OFFSET, Map.of(0, 0L, 1, 1L, 2, 2L)));
    seek.assignAndSeek(consumer);
    assertThat(consumer.assignment()).containsExactlyInAnyOrder(tp0, tp1, tp2);
    assertThat(consumer.position(tp0)).isEqualTo(0L);
    assertThat(consumer.position(tp1)).isEqualTo(1L);
    assertThat(consumer.position(tp2)).isEqualTo(2L);
  }

  @Nested
  class WaitingOffsetsTest {

    ConsumingService.OffsetsSeek.WaitingOffsets offsets;

    @BeforeEach
    void assignAndCreateOffsets() {
      consumer.assign(List.of(tp0, tp1, tp2, tp3));
      offsets = new ConsumingService.OffsetsSeek.WaitingOffsets(topic, consumer);
    }

    @Test
    void collectsSignificantOffsetsMinus1ForAssignedPartitions() {
      // offsets for partition 0 & 1 should be skipped because they
      // effectively contains no data (start offset = end offset)
      assertThat(offsets.offsets).containsExactlyInAnyOrderEntriesOf(
          Map.of(2, 19L, 3, 29L)
      );
    }

    @Test
    void returnTrueWhenOffsetsReachedReached() {
      assertThat(offsets.endReached()).isFalse();
      offsets.markPolled(new ConsumerRecord<>(topic, 2, 19, null, null));
      assertThat(offsets.endReached()).isFalse();
      offsets.markPolled(new ConsumerRecord<>(topic, 3, 29, null, null));
      assertThat(offsets.endReached()).isTrue();
    }
  }

}
