package com.provectus.kafka.ui.cluster.deserialization;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.Message;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaUtils;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.entities.Schema;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import lombok.extern.log4j.Log4j2;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Log4j2
public class SchemaRegistryRecordDeserializer implements RecordDeserializer {

	private final static int CLIENT_IDENTITY_MAP_CAPACITY = 100;

	private final KafkaCluster cluster;
	private final SchemaRegistryClient schemaRegistryClient;
	private final KafkaAvroDeserializer avroDeserializer;
	private final KafkaProtobufDeserializer<?> protobufDeserializer;
	private final ObjectMapper objectMapper;
	private final StringDeserializer stringDeserializer;

	private final Map<String, MessageFormat> topicFormatMap = new ConcurrentHashMap<>();

	public SchemaRegistryRecordDeserializer(KafkaCluster cluster, ObjectMapper objectMapper) {
		this.cluster = cluster;
		this.objectMapper = objectMapper;

		this.schemaRegistryClient = Optional.ofNullable(cluster.getSchemaRegistry())
                .map(schemaRegistryUrl -> {
                            List<SchemaProvider> schemaProviders = List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider());
                            return new CachedSchemaRegistryClient(
                                    Collections.singletonList(schemaRegistryUrl),
                                    CLIENT_IDENTITY_MAP_CAPACITY,
                                    schemaProviders,
                                    Collections.emptyMap()
                            );
                        }
                ).orElse(null);

		this.avroDeserializer = Optional.ofNullable(this.schemaRegistryClient)
				.map(KafkaAvroDeserializer::new)
				.orElse(null);
		this.protobufDeserializer = Optional.ofNullable(this.schemaRegistryClient)
				.map(KafkaProtobufDeserializer::new)
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
				case PROTOBUF:
					parsedValue = parseProtobufRecord(record);
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
		String schemaName = String.format(cluster.getSchemaNameTemplate(), record.topic());
		if (schemaRegistryClient != null) {
			try {
				final List<Integer> versions = schemaRegistryClient.getAllVersions(schemaName);
				if (!versions.isEmpty()) {
					final Integer version = versions.iterator().next();
					final String subjectName = String.format(cluster.getSchemaNameTemplate(), record.topic());
					final Schema schema = schemaRegistryClient.getByVersion(subjectName, version, false);
					if (schema.getSchemaType().equals(MessageFormat.PROTOBUF.name())) {
						try {
							protobufDeserializer.deserialize(record.topic(), record.value().get());
							return MessageFormat.PROTOBUF;
						} catch (Throwable e) {
							log.info("Failed to get Protobuf schema for topic {}", record.topic(), e);
						}
					} else if (schema.getSchemaType().equals(MessageFormat.AVRO.name())) {
						try {
							avroDeserializer.deserialize(record.topic(), record.value().get());
							return MessageFormat.AVRO;
						} catch (Throwable e) {
							log.info("Failed to get Avro schema for topic {}", record.topic(), e);
						}
					} else if (schema.getSchemaType().equals(MessageFormat.JSON.name())) {
						try {
							parseJsonRecord(record);
							return MessageFormat.JSON;
						} catch (IOException e) {
							log.info("Failed to parse json from topic {}", record.topic());
						}
					}
				}
			} catch (RestClientException | IOException e) {
				log.warn("Failed to get Schema for topic {}", record.topic(), e);
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
			return Map.of();
		}
	}

	private Object parseProtobufRecord(ConsumerRecord<Bytes, Bytes> record) throws IOException {
		String topic = record.topic();
		if (record.value()!=null && protobufDeserializer !=null) {
			byte[] valueBytes = record.value().get();
			final Message message = protobufDeserializer.deserialize(topic, valueBytes);
			byte[] bytes = ProtobufSchemaUtils.toJson(message);
			return parseJson(bytes);
		} else {
			return Map.of();
		}
	}

	private Object parseJsonRecord(ConsumerRecord<Bytes, Bytes> record) throws IOException {
		var value = record.value();
		if (value == null) {
			return Map.of();
		}
		byte[] valueBytes = value.get();
		return parseJson(valueBytes);
	}

	private Object parseJson(byte[] bytes) throws IOException {
		return objectMapper.readValue(bytes, new TypeReference<Map<String, Object>>() {
		});
	}

	private Object parseStringRecord(ConsumerRecord<Bytes, Bytes> record) {
		String topic = record.topic();
		if (record.value() == null) {
			return Map.of();
		}
		byte[] valueBytes = record.value().get();
		return stringDeserializer.deserialize(topic, valueBytes);
	}

	public enum MessageFormat {
		AVRO,
		JSON,
		STRING,
		PROTOBUF
	}
}
