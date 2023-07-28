package com.provectus.kafka.ui.emitter;

import com.google.common.base.Preconditions;
import com.google.common.base.Stopwatch;
import com.provectus.kafka.ui.util.ApplicationMetrics;
import java.time.Duration;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Delegate;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;


@RequiredArgsConstructor
public class EnhancedConsumer implements Consumer<Bytes, Bytes> {

  @Delegate
  private final Consumer<Bytes, Bytes> consumer;
  private final PollingThrottler throttler;
  private final ApplicationMetrics metrics;

  public static EnhancedConsumer create(Properties properties,
                                        PollingThrottler throttler,
                                        ApplicationMetrics metrics) {
    return new EnhancedConsumer(createInternalConsumer(properties, metrics), throttler, metrics);
  }

  private static KafkaConsumer<Bytes, Bytes> createInternalConsumer(Properties properties, ApplicationMetrics metrics) {
    metrics.activeConsumers().incrementAndGet();
    try {
      return new KafkaConsumer<>(properties) {
        @Override
        public void close(Duration timeout) {
          metrics.activeConsumers().decrementAndGet();
          super.close(timeout);
        }
      };
    } catch (Exception e) {
      metrics.activeConsumers().decrementAndGet();
      throw e;
    }
  }

  public PolledRecords pollEnhanced(Duration dur) {
    var stopwatch = Stopwatch.createStarted();
    ConsumerRecords<Bytes, Bytes> polled = consumer.poll(dur);
    PolledRecords polledEnhanced = PolledRecords.create(polled, stopwatch.elapsed());
    var throttled = throttler.throttleAfterPoll(polledEnhanced.bytes());
    metrics.meterPolledRecords(topic(), polledEnhanced, throttled);
    return polledEnhanced;
  }

  private String topic() {
    var topics = consumer.assignment().stream().map(TopicPartition::topic).toList();
    // we assume that consumer will always read single topic
    Preconditions.checkArgument(topics.size() == 1);
    return topics.get(0);
  }

}
