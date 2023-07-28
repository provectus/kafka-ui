package com.provectus.kafka.ui.emitter;

import com.google.common.base.Preconditions;
import com.google.common.base.Stopwatch;
import com.provectus.kafka.ui.util.ApplicationMetrics;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Delegate;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRebalanceListener;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;


public class EnhancedConsumer extends KafkaConsumer<Bytes, Bytes> {

  private final PollingThrottler throttler;
  private final ApplicationMetrics metrics;
  private String pollingTopic;

  public EnhancedConsumer(Properties properties,
                          PollingThrottler throttler,
                          ApplicationMetrics metrics) {
    super(properties, new BytesDeserializer(), new BytesDeserializer());
    this.throttler = throttler;
    this.metrics = metrics;
    metrics.activeConsumers().incrementAndGet();
  }

  public PolledRecords pollEnhanced(Duration dur) {
    var stopwatch = Stopwatch.createStarted();
    ConsumerRecords<Bytes, Bytes> polled = poll(dur);
    PolledRecords polledEnhanced = PolledRecords.create(polled, stopwatch.elapsed());
    var throttled = throttler.throttleAfterPoll(polledEnhanced.bytes());
    metrics.meterPolledRecords(pollingTopic, polledEnhanced, throttled);
    return polledEnhanced;
  }

  @Override
  public void assign(Collection<TopicPartition> partitions) {
    super.assign(partitions);
    Set<String> assignedTopics = partitions.stream().map(TopicPartition::topic).collect(Collectors.toSet());
    Preconditions.checkState(assignedTopics.size() == 1);
    this.pollingTopic = assignedTopics.iterator().next();
  }

  @Override
  public void subscribe(Pattern pattern) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void subscribe(Collection<String> topics) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void subscribe(Pattern pattern, ConsumerRebalanceListener listener) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void subscribe(Collection<String> topics, ConsumerRebalanceListener listener) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void close(Duration timeout) {
    metrics.activeConsumers().decrementAndGet();
    super.close(timeout);
  }

}
