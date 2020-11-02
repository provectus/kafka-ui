package com.provectus.kafka.ui.cluster.deserialization;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import lombok.extern.log4j.Log4j2;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Log4j2
public class SchemaRegistryRecordDeserializer implements RecordDeserializer {

	private final static int CLIENT_IDENTITY_MAP_CAPACITY = 100;

	private final KafkaCluster cluster;
	private final SchemaRegistryClient schemaRegistryClient;
	private final KafkaAvroDeserializer avroDeserializer;
	private final ObjectMapper objectMapper;
	private final StringDeserializer stringDeserializer;

	private final Map<String, MessageFormat> topicFormatMap = new ConcurrentHashMap<>();

	public SchemaRegistryRecordDeserializer(KafkaCluster cluster, ObjectMapper objectMapper) {
		this.cluster = cluster;
		this.objectMapper = objectMapper;

		this.schemaRegistryClient = Optional.ofNullable(cluster.getSchemaRegistry()).map(e ->
						new CachedSchemaRegistryClient(
								Collections.singletonList(e),
								CLIENT_IDENTITY_MAP_CAPACITY,
								Collections.singletonList(new AvroSchemaProvider()),
								Collections.emptyMap()
						)
		).orElse(null);

		this.avroDeserializer = Optional.ofNullable(this.schemaRegistryClient)
				.map(KafkaAvroDeserializer::new)
				.orElse(null);
		this.stringDeserializer = new StringDeserializer();
	}

	public Object deserialize(ConsumerRecord<Bytes, Bytes> record) {
		MessageFormat format = getMessageFormat(record);

		try {
			Object parsedValue;
			switch (format) {
				case AVRO:
					parsedValue = parseAvroRecord(record);
					break;
				case JSON:
					parsedValue = parseJsonRecord(record);
					break;
				case STRING:
					parsedValue = parseStringRecord(record);
					break;
				default:
					throw new IllegalArgumentException("Unknown message format " + format + " for topic " + record.topic());
			}
			return parsedValue;
		} catch (IOException e) {
			throw new RuntimeException("Failed to parse record from topic " + record.topic(), e);
		}
	}

	private MessageFormat getMessageFormat(ConsumerRecord<Bytes, Bytes> record) {
		return topicFormatMap.computeIfAbsent(record.topic(), k -> detectFormat(record));
	}

	private MessageFormat detectFormat(ConsumerRecord<Bytes, Bytes> record) {
		String avroSchema = String.format(cluster.getSchemaNameTemplate(), record.topic());
		if (schemaRegistryClient != null) {
			try {
				schemaRegistryClient.getAllVersions(avroSchema);
				return MessageFormat.AVRO;
			} catch (RestClientException | IOException e) {
				log.info("Failed to get Avro schema for topic {}", record.topic());
			}
		}

		try {
			parseJsonRecord(record);
			return MessageFormat.JSON;
		} catch (IOException e) {
			log.info("Failed to parse json from topic {}", record.topic());
		}

		return MessageFormat.STRING;
	}

	private Object parseAvroRecord(ConsumerRecord<Bytes, Bytes> record) throws IOException {
		String topic = record.topic();
		if (record.value()!=null && avroDeserializer !=null) {
			byte[] valueBytes = record.value().get();
			GenericRecord avroRecord = (GenericRecord) avroDeserializer.deserialize(topic, valueBytes);
			byte[] bytes = AvroSchemaUtils.toJson(avroRecord);
			return parseJson(bytes);
		} else {
			return new HashMap<String,Object>();
		}
	}

	private Object parseJsonRecord(ConsumerRecord<Bytes, Bytes> record) throws IOException {
		byte[] valueBytes = record.value().get();
		return parseJson(valueBytes);
	}

	private Object parseJson(byte[] bytes) throws IOException {
		return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
		});
	}

	private Object parseStringRecord(ConsumerRecord<Bytes, Bytes> record) {
		String topic = record.topic();
		byte[] valueBytes = record.value().get();
		return stringDeserializer.deserialize(topic, valueBytes);
	}

	public enum MessageFormat {
		AVRO,
		JSON,
		STRING
	}
}
