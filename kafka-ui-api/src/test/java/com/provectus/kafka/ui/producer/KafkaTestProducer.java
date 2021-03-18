package com.provectus.kafka.ui.producer;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import org.testcontainers.containers.KafkaContainer;

import java.util.Map;
import java.util.concurrent.Future;

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
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
				ProducerConfig.PARTITIONER_CLASS_CONFIG, RoundRobinPartitioner.class
        )));
    }

    public Future<RecordMetadata> send(String topic, ValueT value) {
        return producer.send(new ProducerRecord<>(topic, value));
    }

	public Future<RecordMetadata> send(ProducerRecord<KeyT, ValueT> record) {
		return producer.send(record);
	}

    @Override
    public void close() {
        producer.close();
    }
}
