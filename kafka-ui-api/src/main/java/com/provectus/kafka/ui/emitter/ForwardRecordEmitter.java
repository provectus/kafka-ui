package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class ForwardRecordEmitter
    extends AbstractEmitter {

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final ConsumerPosition position;

  public ForwardRecordEmitter(
      Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      ConsumerPosition position,
      ConsumerRecordDeserializer recordDeserializer,
      PollingSettings pollingSettings) {
    super(recordDeserializer, pollingSettings);
    this.position = position;
    this.consumerSupplier = consumerSupplier;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting forward polling for {}", position);
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      sendPhase(sink, "Assigning partitions");
      var seekOperations = SeekOperations.create(consumer, position);
      seekOperations.assignAndSeekNonEmptyPartitions();

      EmptyPollsCounter emptyPolls = pollingSettings.createEmptyPollsCounter();
      while (!sink.isCancelled()
          && !seekOperations.assignedPartitionsFullyPolled()
          && !emptyPolls.noDataEmptyPollsReached()) {

        sendPhase(sink, "Polling");
        ConsumerRecords<Bytes, Bytes> records = poll(sink, consumer);
        emptyPolls.count(records);

        log.debug("{} records polled", records.count());

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          if (!sink.isCancelled()) {
            sendMessage(sink, msg);
          } else {
            break;
          }
        }
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
}
