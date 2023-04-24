package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class ForwardRecordEmitter extends AbstractEmitter {

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final ConsumerPosition position;
  private final Cursor.Tracking cursor;

  public ForwardRecordEmitter(
      Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      ConsumerPosition position,
      MessagesProcessing messagesProcessing,
      PollingSettings pollingSettings,
      Cursor.Tracking cursor) {
    super(messagesProcessing, pollingSettings);
    this.position = position;
    this.consumerSupplier = consumerSupplier;
    this.cursor = cursor;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting forward polling for {}", position);
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      sendPhase(sink, "Assigning partitions");
      var seekOperations = SeekOperations.create(consumer, position);
      seekOperations.assignAndSeek();
      cursor.trackOffsets(seekOperations.getOffsetsForSeek());

      EmptyPollsCounter emptyPolls = pollingSettings.createEmptyPollsCounter();
      while (!sink.isCancelled()
          && !isSendLimitReached()
          && !seekOperations.assignedPartitionsFullyPolled()
          && !emptyPolls.noDataEmptyPollsReached()) {

        sendPhase(sink, "Polling");
        ConsumerRecords<Bytes, Bytes> records = poll(sink, consumer);
        emptyPolls.count(records);
        trackOffsetsAfterPoll(consumer);

        log.debug("{} records polled", records.count());

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          sendMessage(sink, msg);
        }
      }
      sendFinishStatsAndCompleteSink(sink, seekOperations.assignedPartitionsFullyPolled() ? null : cursor);
      log.debug("Polling finished");
    } catch (InterruptException kafkaInterruptException) {
      log.debug("Polling finished due to thread interruption");
      sink.complete();
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }

  private void trackOffsetsAfterPoll(Consumer<Bytes, Bytes> consumer) {
    consumer.assignment().forEach(tp -> cursor.trackOffset(tp, consumer.position(tp)));
  }

}
