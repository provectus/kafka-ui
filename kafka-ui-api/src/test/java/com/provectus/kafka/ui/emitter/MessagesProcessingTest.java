package com.provectus.kafka.ui.emitter;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.RepeatedTest;

class MessagesProcessingTest {


  @RepeatedTest(5)
  void testSortingAsc() {
    var messagesInOrder = List.of(
        consumerRecord(1, 100L, "1999-01-01T00:00:00+00:00"),
        consumerRecord(0, 0L, "2000-01-01T00:00:00+00:00"),
        consumerRecord(1, 200L, "2000-01-05T00:00:00+00:00"),
        consumerRecord(0, 10L, "2000-01-10T00:00:00+00:00"),
        consumerRecord(0, 20L, "2000-01-20T00:00:00+00:00"),
        consumerRecord(1, 300L, "3000-01-01T00:00:00+00:00"),
        consumerRecord(2, 1000L, "4000-01-01T00:00:00+00:00"),
        consumerRecord(2, 1001L, "2000-01-01T00:00:00+00:00"),
        consumerRecord(2, 1003L, "3000-01-01T00:00:00+00:00")
    );

    var shuffled = new ArrayList<>(messagesInOrder);
    Collections.shuffle(shuffled);

    var sortedList = MessagesProcessing.sortForSending(shuffled, true);
    assertThat(sortedList).containsExactlyElementsOf(messagesInOrder);
  }

  @RepeatedTest(5)
  void testSortingDesc() {
    var messagesInOrder = List.of(
        consumerRecord(1, 300L, "3000-01-01T00:00:00+00:00"),
        consumerRecord(2, 1003L, "3000-01-01T00:00:00+00:00"),
        consumerRecord(0, 20L, "2000-01-20T00:00:00+00:00"),
        consumerRecord(0, 10L, "2000-01-10T00:00:00+00:00"),
        consumerRecord(1, 200L, "2000-01-05T00:00:00+00:00"),
        consumerRecord(0, 0L, "2000-01-01T00:00:00+00:00"),
        consumerRecord(2, 1001L, "2000-01-01T00:00:00+00:00"),
        consumerRecord(2, 1000L, "4000-01-01T00:00:00+00:00"),
        consumerRecord(1, 100L, "1999-01-01T00:00:00+00:00")
    );

    var shuffled = new ArrayList<>(messagesInOrder);
    Collections.shuffle(shuffled);

    var sortedList = MessagesProcessing.sortForSending(shuffled, false);
    assertThat(sortedList).containsExactlyElementsOf(messagesInOrder);
  }

  private ConsumerRecord<Bytes, Bytes> consumerRecord(int partition, long offset, String ts) {
    return new ConsumerRecord<>(
        "topic", partition, offset, OffsetDateTime.parse(ts).toInstant().toEpochMilli(),
        TimestampType.CREATE_TIME,
        0, 0, null, null, new RecordHeaders(), Optional.empty()
    );
  }

}
