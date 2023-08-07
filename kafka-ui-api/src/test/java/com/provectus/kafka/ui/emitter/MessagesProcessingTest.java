package com.provectus.kafka.ui.emitter;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.RepeatedTest;

class MessagesProcessingTest {

  @RepeatedTest(5)
  void testSortingAsc() {
    var messagesInOrder = List.of(
        new TopicMessageDTO(1, 100L, OffsetDateTime.parse("1999-01-01T00:00:00+00:00")),
        new TopicMessageDTO(0, 0L, OffsetDateTime.parse("2000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(1, 200L, OffsetDateTime.parse("2000-01-05T00:00:00+00:00")),
        new TopicMessageDTO(0, 10L, OffsetDateTime.parse("2000-01-10T00:00:00+00:00")),
        new TopicMessageDTO(0, 20L, OffsetDateTime.parse("2000-01-20T00:00:00+00:00")),
        new TopicMessageDTO(1, 300L, OffsetDateTime.parse("3000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(2, 1000L, OffsetDateTime.parse("4000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(2, 1001L, OffsetDateTime.parse("2000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(2, 1003L, OffsetDateTime.parse("3000-01-01T00:00:00+00:00"))
    );

    var shuffled = new ArrayList<>(messagesInOrder);
    Collections.shuffle(shuffled);

    var sortedList = MessagesProcessing.sorted(shuffled, true).toList();
    assertThat(sortedList).containsExactlyElementsOf(messagesInOrder);
  }


  @RepeatedTest(5)
  void testSortingDesc() {
    var messagesInOrder = List.of(
        new TopicMessageDTO(1, 300L, OffsetDateTime.parse("3000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(2, 1003L, OffsetDateTime.parse("3000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(0, 20L, OffsetDateTime.parse("2000-01-20T00:00:00+00:00")),
        new TopicMessageDTO(0, 10L, OffsetDateTime.parse("2000-01-10T00:00:00+00:00")),
        new TopicMessageDTO(1, 200L, OffsetDateTime.parse("2000-01-05T00:00:00+00:00")),
        new TopicMessageDTO(0, 0L, OffsetDateTime.parse("2000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(2, 1001L, OffsetDateTime.parse("2000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(2, 1000L, OffsetDateTime.parse("4000-01-01T00:00:00+00:00")),
        new TopicMessageDTO(1, 100L, OffsetDateTime.parse("1999-01-01T00:00:00+00:00"))
    );

    var shuffled = new ArrayList<>(messagesInOrder);
    Collections.shuffle(shuffled);

    var sortedList = MessagesProcessing.sorted(shuffled, false).toList();
    assertThat(sortedList).containsExactlyElementsOf(messagesInOrder);
  }

}
