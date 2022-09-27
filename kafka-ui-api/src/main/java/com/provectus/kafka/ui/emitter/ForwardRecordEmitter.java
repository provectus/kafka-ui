package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import com.provectus.kafka.ui.util.OffsetsSeek;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class ForwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final OffsetsSeek offsetsSeek;

  public ForwardRecordEmitter(
      Supplier<KafkaConsumer<Bytes, Bytes>> consumerSupplier,
      OffsetsSeek offsetsSeek,
      ConsumerRecordDeserializer recordDeserializer) {
    super(recordDeserializer);
    this.consumerSupplier = consumerSupplier;
    this.offsetsSeek = offsetsSeek;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    try (KafkaConsumer<Bytes, Bytes> consumer = consumerSupplier.get()) {
      sendPhase(sink, "Assigning partitions");
      var waitingOffsets = offsetsSeek.assignAndSeek(consumer);
      // we use empty polls counting to verify that topic was fully read
      int emptyPolls = 0;
      while (!sink.isCancelled() && !waitingOffsets.endReached() && emptyPolls < NO_MORE_DATA_EMPTY_POLLS_COUNT) {
        sendPhase(sink, "Polling");
        ConsumerRecords<Bytes, Bytes> records = poll(sink, consumer);
        log.info("{} records polled", records.count());
        emptyPolls = records.isEmpty() ? emptyPolls + 1 : 0;

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          if (!sink.isCancelled() && !waitingOffsets.endReached()) {
            sendMessage(sink, msg);
            waitingOffsets.markPolled(msg);
          } else {
            break;
          }
        }
      }
      sink.complete();
      log.info("Polling finished");
    } catch (Exception e) {
      log.error("Error occurred while consuming records", e);
      sink.error(e);
    }
  }
}
