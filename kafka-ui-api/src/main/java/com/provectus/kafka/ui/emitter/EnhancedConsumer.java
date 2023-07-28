package com.provectus.kafka.ui.emitter;

import com.google.common.base.Stopwatch;
import java.time.Duration;
import java.util.Iterator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Delegate;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.utils.Bytes;


@RequiredArgsConstructor
public class EnhancedConsumer implements Consumer<Bytes, Bytes> {

  public record PolledRecords(int count, int bytes, Duration elapsed, ConsumerRecords<Bytes, Bytes> records)
      implements Iterable<ConsumerRecord<Bytes, Bytes>> {

    static PolledRecords create(ConsumerRecords<Bytes, Bytes> polled, Duration pollDuration) {
      return new PolledRecords(
          polled.count(),
          calculatePolledRecSize(polled),
          pollDuration,
          polled
      );
    }

    public List<ConsumerRecord<Bytes, Bytes>> records(TopicPartition tp) {
      return records.records(tp);
    }

    @Override
    public Iterator<ConsumerRecord<Bytes, Bytes>> iterator() {
      return records.iterator();
    }
  }

  @Delegate
  private final Consumer<Bytes, Bytes> consumer;
  private final PollingThrottler throttler;

  public PolledRecords pollEnhanced(Duration dur) {
    var stopwatch = Stopwatch.createStarted();
    ConsumerRecords<Bytes, Bytes> polled = consumer.poll(dur);
    PolledRecords polledEnhanced = PolledRecords.create(polled, stopwatch.elapsed());
    throttler.throttleAfterPoll(polledEnhanced.bytes);
    return polledEnhanced;
  }

  private static int calculatePolledRecSize(Iterable<ConsumerRecord<Bytes, Bytes>> recs) {
    int polledBytes = 0;
    for (ConsumerRecord<Bytes, Bytes> rec : recs) {
      for (Header header : rec.headers()) {
        polledBytes +=
            (header.key() != null ? header.key().getBytes().length : 0)
                + (header.value() != null ? header.value().length : 0);
      }
      polledBytes += rec.key() == null ? 0 : rec.serializedKeySize();
      polledBytes += rec.value() == null ? 0 : rec.serializedValueSize();
    }
    return polledBytes;
  }

}
