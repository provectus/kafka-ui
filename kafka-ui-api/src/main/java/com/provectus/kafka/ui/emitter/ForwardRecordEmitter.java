package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
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
        log.debug("{} records polled", records.count());

        for (TopicPartition tp : records.partitions()) {
          for (ConsumerRecord<Bytes, Bytes> record : records.records(tp)) {
            // checking if send limit reached - if so, we will skip some
            // of already polled records (and we don't need to track their offsets) - they
            // should be present on next page, polled by cursor
            if (!isSendLimitReached()) {
              sendMessage(sink, record);
              cursor.trackOffset(tp, record.offset() + 1);
            }
          }
        }
      }
      sendFinishStatsAndCompleteSink(sink, !isSendLimitReached() ? null : cursor);
      log.debug("Polling finished");
    } catch (InterruptException kafkaInterruptException) {
      log.debug("Polling finished due to thread interruption");
      sink.complete();
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }

}
