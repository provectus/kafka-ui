package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.util.SslPropertiesUtil;
import java.util.Properties;
import java.util.Random;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.serialization.ByteArraySerializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;

@Slf4j
public class ForwardRecordEmitter
    extends AbstractEmitter
    implements java.util.function.Consumer<FluxSink<TopicMessageEventDTO>> {

  private final Supplier<EnhancedConsumer> consumerSupplier;
  private final ConsumerPosition position;

  public ForwardRecordEmitter(
      Supplier<EnhancedConsumer> consumerSupplier,
      ConsumerPosition position,
      MessagesProcessing messagesProcessing,
      PollingSettings pollingSettings) {
    super(messagesProcessing, pollingSettings);
    this.position = position;
    this.consumerSupplier = consumerSupplier;
  }

  @Override
  public void accept(FluxSink<TopicMessageEventDTO> sink) {
    log.debug("Starting forward polling for {}", position);
    try (EnhancedConsumer consumer = consumerSupplier.get()) {
      sendPhase(sink, "Assigning partitions");
      var seekOperations = SeekOperations.create(consumer, position);
      seekOperations.assignAndSeekNonEmptyPartitions();

      while (!sink.isCancelled()
          && !sendLimitReached()
          && !seekOperations.assignedPartitionsFullyPolled()) {
        sendPhase(sink, "Polling");
        var records = poll(sink, consumer);

        log.debug("{} records polled", records.count());

        for (ConsumerRecord<Bytes, Bytes> msg : records) {
          sendMessage(sink, msg);
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

  //  public static void main(String[] args) {
  //    String topic = "test";
  //
  //    Properties properties = new Properties();
  //    properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
  //    properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
  //    properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
  //    try (var producer = new KafkaProducer<>(properties)) {
  //      for (int i = 0; i < 10; i++) {
  //        for (int j = 0; j < 30; j++) {
  //          producer.send(new ProducerRecord<>(topic, (i + 1) + "", "j=" + j + "-" + RandomStringUtils.random(5)));
  //        }
  //      }
  //    }
  //  }

}
