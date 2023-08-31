package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
abstract class RangePollingEmitter extends AbstractEmitter {

  private final Supplier<EnhancedConsumer> consumerSupplier;
  protected final ConsumerPosition consumerPosition;
  protected final int messagesPerPage;

  protected RangePollingEmitter(Supplier<EnhancedConsumer> consumerSupplier,
                                ConsumerPosition consumerPosition,
                                int messagesPerPage,
                                MessagesProcessing messagesProcessing,
                                PollingSettings pollingSettings) {
    super(messagesProcessing, pollingSettings);
    this.consumerPosition = consumerPosition;
    this.messagesPerPage = messagesPerPage;
    this.consumerSupplier = consumerSupplier;
  }

  protected record FromToOffset(/*inclusive*/ long from, /*exclusive*/ long to) {
  }

  //should return empty map if polling should be stopped
  protected abstract TreeMap<TopicPartition, FromToOffset> nextPollingRange(
      TreeMap<TopicPartition, FromToOffset> prevRange, //empty on start
      SeekOperations seekOperations
  );

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting polling for {}", consumerPosition);
    try (EnhancedConsumer consumer = consumerSupplier.get()) {
      sendPhase(sink, "Consumer created");
      var seekOperations = SeekOperations.create(consumer, consumerPosition);
      TreeMap<TopicPartition, FromToOffset> pollRange = nextPollingRange(new TreeMap<>(), seekOperations);
      log.debug("Starting from offsets {}", pollRange);

      while (!sink.isCancelled() && !pollRange.isEmpty() && !sendLimitReached()) {
        var polled = poll(consumer, sink, pollRange);
        send(sink, polled);
        pollRange = nextPollingRange(pollRange, seekOperations);
      }
      if (sink.isCancelled()) {
        log.debug("Polling finished due to sink cancellation");
      }
      sendFinishStatsAndCompleteSink(sink);
      log.debug("Polling finished");
    } catch (InterruptException kafkaInterruptException) {
      log.debug("Polling finished due to thread interruption");
      sink.complete();
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }

  private List<ConsumerRecord<Bytes, Bytes>> poll(EnhancedConsumer consumer,
                                                  FluxSink<TopicMessageEventDTO> sink,
                                                  TreeMap<TopicPartition, FromToOffset> range) {
    log.trace("Polling range {}", range);
    sendPhase(sink,
        "Polling partitions: %s".formatted(range.keySet().stream().map(TopicPartition::partition).sorted().toList()));

    consumer.assign(range.keySet());
    range.forEach((tp, fromTo) -> consumer.seek(tp, fromTo.from));

    List<ConsumerRecord<Bytes, Bytes>> result = new ArrayList<>();
    while (!sink.isCancelled() && consumer.paused().size() < range.size()) {
      var polledRecords = poll(sink, consumer);
      range.forEach((tp, fromTo) -> {
        polledRecords.records(tp).stream()
            .filter(r -> r.offset() < fromTo.to)
            .forEach(result::add);

        //next position is out of target range -> pausing partition
        if (consumer.position(tp) >= fromTo.to) {
          consumer.pause(List.of(tp));
        }
      });
    }
    consumer.resume(consumer.paused());
    return result;
  }
}
