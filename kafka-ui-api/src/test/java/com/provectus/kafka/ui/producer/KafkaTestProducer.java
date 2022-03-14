package com.provectus.kafka.ui.producer;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.serialization.StringSerializer;
import org.testcontainers.containers.KafkaContainer;

public class KafkaTestProducer<KeyT, ValueT> implements AutoCloseable {
  private final KafkaProducer<KeyT, ValueT> producer;

  private KafkaTestProducer(KafkaProducer<KeyT, ValueT> producer) {
    this.producer = producer;
  }

  public static KafkaTestProducer<String, String> forKafka(KafkaContainer kafkaContainer) {
    return new KafkaTestProducer<>(new KafkaProducer<>(Map.of(
        ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaContainer.getBootstrapServers(),
        ProducerConfig.CLIENT_ID_CONFIG, "KafkaTestProducer",
        ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
        ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class
    )));
  }

  public CompletableFuture<RecordMetadata> send(String topic, ValueT value) {
    return send(new ProducerRecord<>(topic, value));
  }

  public CompletableFuture<RecordMetadata> send(ProducerRecord<KeyT, ValueT> record) {
    CompletableFuture<RecordMetadata> cf = new CompletableFuture<>();
    producer.send(record, (m, e) -> {
      if (e != null) {
        cf.completeExceptionally(e);
      } else {
        cf.complete(m);
      }
    });
    return cf;
  }

  @Override
  public void close() {
    producer.close();
  }
}
