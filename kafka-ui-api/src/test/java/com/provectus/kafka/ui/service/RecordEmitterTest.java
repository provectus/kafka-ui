package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.producer.KafkaTestProducer;
import lombok.Value;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.*;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import static com.provectus.kafka.ui.service.ConsumingService.RecordEmitter;
import static com.provectus.kafka.ui.service.ConsumingService.OffsetsSeek;
import static org.assertj.core.api.Assertions.assertThat;

class RecordEmitterTest extends AbstractBaseTest {

	static final int PARTITIONS = 5;
	static final int MSGS_PER_PARTITION = 100;
	static final long MAX_TS_SHIFT = Duration.ofHours(1).toMillis();

	static String topic = RecordEmitterTest.class.getSimpleName() + "_" + UUID.randomUUID();
	static String emptyTopic = topic + "_empty";
	static List<Record> sentRecords = new ArrayList<>();

	@BeforeAll
	static void generateMsgs() throws Exception {
		createTopic(new NewTopic(topic, 5, (short) 1));
		createTopic(new NewTopic(emptyTopic, 5, (short) 1));
		try (var producer = KafkaTestProducer.forKafka(kafka)) {
			for (int partition = 0; partition < PARTITIONS; partition++) {
				for (int i = 0; i < MSGS_PER_PARTITION; i++) {
					long ts = System.currentTimeMillis() - ThreadLocalRandom.current().nextLong(MAX_TS_SHIFT);
					var value = "msg_" + partition + "_" + i;
					var metadata = producer.send(new ProducerRecord<>(topic, null, ts, null, value)).get();
					sentRecords.add(new Record(value, metadata.partition(), metadata.offset(), ts));
				}
			}
		}
	}

	@AfterAll
	static void clean() {
		deleteTopic(topic);
		deleteTopic(emptyTopic);
	}

	@Test
	void pollNothingOnEmptyTopic() {
		var emitter = new RecordEmitter(
				this::createConsumer,
				new OffsetsSeek(emptyTopic, new ConsumerPosition(SeekType.BEGINNING, Map.of())));

		Long polledValues = Flux.create(emitter)
				.limitRequest(100)
				.count()
				.block();

		assertThat(polledValues).isZero();
	}

	@Test
	void pollFullTopicFromBeginning() {
		var emitter = new RecordEmitter(
				this::createConsumer,
				new OffsetsSeek(topic, new ConsumerPosition(SeekType.BEGINNING, Map.of())));

		var polledValues = Flux.create(emitter)
				.map(this::deserialize)
				.limitRequest(Long.MAX_VALUE)
				.collect(Collectors.toList())
				.block();

		assertThat(polledValues).containsExactlyInAnyOrderElementsOf(
				sentRecords.stream().map(Record::getBody).collect(Collectors.toList()));
	}

	@Test
	void pollWithTimestamps() {
		Map<Integer, Long> targetOffsets = new HashMap<>();
		for (int i = 0; i < PARTITIONS; i++) {
			long offset = ThreadLocalRandom.current().nextLong(MSGS_PER_PARTITION);
			targetOffsets.put(i, offset);
		}

		var emitter = new RecordEmitter(
				this::createConsumer,
				new OffsetsSeek(topic, new ConsumerPosition(SeekType.OFFSET, targetOffsets)));

		var polledValues = Flux.create(emitter)
				.map(this::deserialize)
				.limitRequest(Long.MAX_VALUE)
				.collect(Collectors.toList())
				.block();

		var expectedValues = sentRecords.stream()
				.filter(r -> r.getOffset() >= targetOffsets.get(r.getPartition()))
				.map(Record::getBody)
				.collect(Collectors.toList());

		assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);
	}

	@Test
	void pollWithOffsets() {
		Map<Integer, Long> targetTimestamps = new HashMap<>();
		for (int i = 0; i < PARTITIONS; i++) {
			long ts = System.currentTimeMillis() - ThreadLocalRandom.current().nextLong(System.currentTimeMillis());
			targetTimestamps.put(i, ts);
		}

		var emitter = new RecordEmitter(
				this::createConsumer,
				new OffsetsSeek(topic, new ConsumerPosition(SeekType.TIMESTAMP, targetTimestamps)));

		var polledValues = Flux.create(emitter)
				.map(this::deserialize)
				.limitRequest(Long.MAX_VALUE)
				.collect(Collectors.toList())
				.block();

		var expectedValues = sentRecords.stream()
				.filter(r -> r.getTimestamp() >= targetTimestamps.get(r.getPartition()))
				.map(Record::getBody)
				.collect(Collectors.toList());

		assertThat(polledValues).containsExactlyInAnyOrderElementsOf(expectedValues);
	}

	private KafkaConsumer<Bytes, Bytes> createConsumer() {
		return new KafkaConsumer<>(
				Map.of(
						ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers(),
						ConsumerConfig.GROUP_ID_CONFIG, UUID.randomUUID().toString(),
						ConsumerConfig.MAX_POLL_RECORDS_CONFIG, MSGS_PER_PARTITION / 2,
						ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class,
						ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class
				)
		);
	}

	private String deserialize(ConsumerRecord<Bytes, Bytes> rec) {
		return new StringDeserializer().deserialize(topic, rec.value().get());
	}

	@Value
	static class Record {
		String body;
		int partition;
		long offset;
		long timestamp;
	}
}
