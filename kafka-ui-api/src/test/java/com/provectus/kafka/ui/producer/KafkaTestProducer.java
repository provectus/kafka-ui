package com.provectus.kafka.ui.producer;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.testcontainers.containers.KafkaContainer;

import java.util.Map;

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

    public void send(String topic, ValueT value) {
        producer.send(new ProducerRecord<>(topic, value));
    }

    @Override
    public void close() {
        producer.close();
    }
}
