package com.provectus.kafka.ui.cluster.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import com.provectus.kafka.ui.cluster.deserialization.DeserializationService;
import com.provectus.kafka.ui.cluster.deserialization.RecordDeserializer;
import com.provectus.kafka.ui.cluster.model.ConsumerPosition;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.model.TopicMessage;

import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.scheduler.Schedulers;

@Service
@Log4j2
@RequiredArgsConstructor
public class ConsumingService {

	private static final int MAX_RECORD_LIMIT = 100;
	private static final int DEFAULT_RECORD_LIMIT = 20;
	private static final int MAX_POLLS_COUNT = 30;

	private final KafkaService kafkaService;
	private final DeserializationService deserializationService;

	public Flux<TopicMessage> loadMessages(KafkaCluster cluster, String topic, ConsumerPosition consumerPosition, Integer limit) {
		int recordsLimit = Optional.ofNullable(limit)
				.map(s -> Math.min(s, MAX_RECORD_LIMIT))
				.orElse(DEFAULT_RECORD_LIMIT);
		RecordEmitter emitter = new RecordEmitter(kafkaService, cluster, topic, consumerPosition);
		RecordDeserializer recordDeserializer = deserializationService.getRecordDeserializerForCluster(cluster);
		return Flux.create(emitter::emit)
				.subscribeOn(Schedulers.boundedElastic())
				.map(r -> ClusterUtil.mapToTopicMessage(r, recordDeserializer))
				.limitRequest(recordsLimit);
	}

	@RequiredArgsConstructor
	private static class RecordEmitter {

		private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

		private final KafkaService kafkaService;
		private final KafkaCluster cluster;
		private final String topic;
		private final ConsumerPosition consumerPosition;

		public void emit(FluxSink<ConsumerRecord<Bytes, Bytes>> sink) {
			try (KafkaConsumer<Bytes, Bytes> consumer = kafkaService.createConsumer(cluster)) {
				assignPartitions(consumer);
				seekOffsets(consumer);
				int pollsCount = 0;
				while (!sink.isCancelled() && ++pollsCount < MAX_POLLS_COUNT) {
					ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
					log.info("{} records polled", records.count());
					records.iterator()
							.forEachRemaining(sink::next);
				}
				sink.complete();
			} catch (Exception e) {
				log.error("Error occurred while consuming records", e);
				throw new RuntimeException(e);
			}
		}

		private List<TopicPartition> getRequestedPartitions() {
			Map<Integer, Long> partitionPositions = consumerPosition.getSeekTo();

			return Optional.ofNullable(cluster.getTopics().get(topic))
					.orElseThrow(() -> new IllegalArgumentException("Unknown topic: " + topic))
					.getPartitions().stream()
					.filter(internalPartition -> partitionPositions.isEmpty() || partitionPositions.containsKey(internalPartition.getPartition()))
					.map(partitionInfo -> new TopicPartition(topic, partitionInfo.getPartition()))
					.collect(Collectors.toList());
		}

		private void assignPartitions(KafkaConsumer<Bytes, Bytes> consumer) {
			List<TopicPartition> partitions =  getRequestedPartitions();

			consumer.assign(partitions);
		}

		private void seekOffsets(KafkaConsumer<Bytes, Bytes> consumer) {
			SeekType seekType = consumerPosition.getSeekType();
			switch (seekType) {
				case OFFSET:
					consumerPosition.getSeekTo().forEach((partition, offset) -> {
						TopicPartition topicPartition = new TopicPartition(topic, partition);
						consumer.seek(topicPartition, offset);
					});
					break;
				case TIMESTAMP:
					Map<TopicPartition, Long> timestampsToSearch = consumerPosition.getSeekTo().entrySet().stream()
							.collect(Collectors.toMap(
									partitionPosition -> new TopicPartition(topic, partitionPosition.getKey()),
									Map.Entry::getValue
							));
					consumer.offsetsForTimes(timestampsToSearch)
							.forEach((topicPartition, offsetAndTimestamp) ->
									consumer.seek(topicPartition, offsetAndTimestamp.offset())
							);
					break;
				case BEGINNING:
					List<TopicPartition> partitions = getRequestedPartitions();
					consumer.seekToBeginning(partitions);
					break;
				default:
					throw new IllegalArgumentException("Unknown seekType: " + seekType);
			}
		}
	}
}
