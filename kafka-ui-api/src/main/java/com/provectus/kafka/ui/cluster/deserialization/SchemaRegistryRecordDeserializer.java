package com.provectus.kafka.ui.cluster.deserialization;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;

import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Log4j2
@RequiredArgsConstructor
public class SchemaRegistryRecordDeserializer implements RecordDeserializer {

	private KafkaAvroDeserializer avroDeserializer;
	private ObjectMapper objectMapper;
	private StringDeserializer stringDeserializer;

	private final Map<String, MessageFormat> topicFormatMap = new ConcurrentHashMap<>();

	public SchemaRegistryRecordDeserializer(String schemaRegistryUrl) {
		List<String> endpoints = Collections.singletonList(schemaRegistryUrl);
		List<SchemaProvider> providers = Arrays.asList(new AvroSchemaProvider(), new JsonSchemaProvider(), new ProtobufSchemaProvider());
		SchemaRegistryClient schemaRegistryClient = new CachedSchemaRegistryClient(endpoints, 100, providers, Collections.emptyMap());

		this.avroDeserializer = new KafkaAvroDeserializer(schemaRegistryClient);
		this.objectMapper = new ObjectMapper();
		this.stringDeserializer = new StringDeserializer();
	}

	public Object deserialize(ConsumerRecord<Bytes, Bytes> record) {
		MessageFormat format = getMessageFormat(record);

		Optional<Object> parsedValue;
		switch (format) {
			case AVRO:
				parsedValue = tryParseAvroRecord(record);
				break;
			case JSON:
				parsedValue = tryParseJsonRecord(record);
				break;
			case STRING:
				parsedValue = parseStringRecord(record);
				break;
			default:
				parsedValue = Optional.empty();
		}

		return parsedValue.orElseThrow(() -> new IllegalArgumentException("Unknown message format from topic " + record.topic()));
	}

	private MessageFormat getMessageFormat(ConsumerRecord<Bytes, Bytes> record) {
		return topicFormatMap.computeIfAbsent(record.topic(), k -> detectFormat(record));
	}

	private MessageFormat detectFormat(ConsumerRecord<Bytes, Bytes> record) {
		Optional<Object> parsedValue = tryParseAvroRecord(record);
		if (parsedValue.isPresent()) {
			return MessageFormat.AVRO;
		}

		parsedValue = tryParseJsonRecord(record);
		if (parsedValue.isPresent()) {
			return MessageFormat.JSON;
		}

		return MessageFormat.STRING;
	}

	private Optional<Object> tryParseAvroRecord(ConsumerRecord<Bytes, Bytes> record) {
		String topic = record.topic();
		byte[] valueBytes = record.value().get();
		try {
			GenericRecord avroRecord = (GenericRecord) avroDeserializer.deserialize(topic, valueBytes);
			byte[] bytes = AvroSchemaUtils.toJson(avroRecord);
			return Optional.of(parseJson(bytes));
		} catch (Exception e) {
			log.error("Record from topic {} isn't Avro record", topic);
			return Optional.empty();
		}
	}

	private Optional<Object> tryParseJsonRecord(ConsumerRecord<Bytes, Bytes> record) {
		String topic = record.topic();
		byte[] valueBytes = record.value().get();
		try {
			return Optional.of(parseJson(valueBytes));
		} catch (Exception e) {
			log.error("Record from topic {} isn't json record", topic);
			return Optional.empty();
		}
	}

	private Object parseJson(byte[] bytes) throws IOException {
		return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
		});
	}

	private Optional<Object> parseStringRecord(ConsumerRecord<Bytes, Bytes> record) {
		String topic = record.topic();
		byte[] valueBytes = record.value().get();
		return Optional.of(stringDeserializer.deserialize(topic, valueBytes));
	}

	public enum MessageFormat {
		AVRO,
		JSON,
		STRING
	}
}
