package com.provectus.kafka.ui.cluster.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.cluster.deserialization.DeserializationService;
import com.provectus.kafka.ui.cluster.deserialization.RecordDeserializer;
import com.provectus.kafka.ui.cluster.model.ConsumerPosition;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.model.TopicMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Log4j2
@RequiredArgsConstructor
public class ConsumingService {

	private static final int MAX_RECORD_LIMIT = 100;
	private static final int DEFAULT_RECORD_LIMIT = 20;

	private final KafkaService kafkaService;
	private final DeserializationService deserializationService;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public Flux<TopicMessage> loadMessages(KafkaCluster cluster, String topic, ConsumerPosition consumerPosition, String query, Integer limit) {
		int recordsLimit = Optional.ofNullable(limit)
				.map(s -> Math.min(s, MAX_RECORD_LIMIT))
				.orElse(DEFAULT_RECORD_LIMIT);
		RecordEmitter emitter = new RecordEmitter(kafkaService, cluster, topic, consumerPosition);
		RecordDeserializer recordDeserializer = deserializationService.getRecordDeserializerForCluster(cluster);
		return Flux.create(emitter::emit)
				.subscribeOn(Schedulers.boundedElastic())
				.map(r -> ClusterUtil.mapToTopicMessage(r, recordDeserializer))
				.filter(m -> filterTopicMessage(m, query))
				.limitRequest(recordsLimit);
	}

	public Mono<Map<TopicPartition, Long>> loadOffsets(KafkaCluster cluster, String topicName, List<Integer> partitionsToInclude) {
		return Mono.fromSupplier(() -> {
			try (KafkaConsumer<Bytes, Bytes> consumer = kafkaService.createConsumer(cluster)) {
				var partitions = consumer.partitionsFor(topicName).stream()
                        .filter(p -> partitionsToInclude.isEmpty() || partitionsToInclude.contains(p.partition()))
						.map(p -> new TopicPartition(topicName, p.partition()))
						.collect(Collectors.toList());
				var beginningOffsets = consumer.beginningOffsets(partitions);
				var endOffsets = consumer.endOffsets(partitions);
				return endOffsets.entrySet().stream()
						.filter(entry -> !beginningOffsets.get(entry.getKey()).equals(entry.getValue()))
						.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
			} catch (Exception e) {
				log.error("Error occurred while consuming records", e);
				throw new RuntimeException(e);
			}
		});
	}

	private boolean filterTopicMessage(TopicMessage message, String query) {
		if (StringUtils.isEmpty(query)) {
			return true;
		}

		Object content = message.getContent();
		JsonNode tree = objectMapper.valueToTree(content);
		return treeContainsValue(tree, query);
	}

	private boolean treeContainsValue(JsonNode tree, String query) {
		LinkedList<JsonNode> nodesForSearch = new LinkedList<>();
		nodesForSearch.add(tree);

		while (!nodesForSearch.isEmpty()) {
			JsonNode node = nodesForSearch.removeFirst();

			if (node.isContainerNode()) {
				node.elements().forEachRemaining(nodesForSearch::add);
				continue;
			}

			String nodeValue = node.asText();
			if (nodeValue.contains(query)) {
				return true;
			}
		}

		return false;
	}

	@RequiredArgsConstructor
	private static class RecordEmitter {
		private static final int MAX_EMPTY_POLLS_COUNT = 3;
		private static final Duration POLL_TIMEOUT_MS = Duration.ofMillis(1000L);

		private final KafkaService kafkaService;
		private final KafkaCluster cluster;
		private final String topic;
		private final ConsumerPosition consumerPosition;

		public void emit(FluxSink<ConsumerRecord<Bytes, Bytes>> sink) {
			try (KafkaConsumer<Bytes, Bytes> consumer = kafkaService.createConsumer(cluster)) {
				assignAndSeek(consumer);
				int emptyPollsCount = 0;
				log.info("assignment: {}", consumer.assignment());
				while (!sink.isCancelled()) {
					ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
					log.info("{} records polled", records.count());
					if (records.count() == 0 && emptyPollsCount > MAX_EMPTY_POLLS_COUNT) {
						break;
					} else {
						emptyPollsCount++;
					}
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
					.getPartitions().values().stream()
					.filter(internalPartition -> partitionPositions.isEmpty() || partitionPositions.containsKey(internalPartition.getPartition()))
					.map(partitionInfo -> new TopicPartition(topic, partitionInfo.getPartition()))
					.collect(Collectors.toList());
		}

		private void assignAndSeek(KafkaConsumer<Bytes, Bytes> consumer) {
			SeekType seekType = consumerPosition.getSeekType();
			switch (seekType) {
				case OFFSET:
					assignAndSeekForOffset(consumer);
					break;
				case TIMESTAMP:
					assignAndSeekForTimestamp(consumer);
					break;
				case BEGINNING:
					assignAndSeekFromBeginning(consumer);
					break;
				default:
					throw new IllegalArgumentException("Unknown seekType: " + seekType);
			}
		}

		private void assignAndSeekForOffset(KafkaConsumer<Bytes, Bytes> consumer) {
			List<TopicPartition> partitions = getRequestedPartitions();
			consumer.assign(partitions);
			consumerPosition.getSeekTo().forEach((partition, offset) -> {
				TopicPartition topicPartition = new TopicPartition(topic, partition);
				consumer.seek(topicPartition, offset);
			});
		}

		private void assignAndSeekForTimestamp(KafkaConsumer<Bytes, Bytes> consumer) {
			Map<TopicPartition, Long> timestampsToSearch = consumerPosition.getSeekTo().entrySet().stream()
					.collect(Collectors.toMap(
							partitionPosition -> new TopicPartition(topic, partitionPosition.getKey()),
							Map.Entry::getValue
					));
			Map<TopicPartition, Long> offsetsForTimestamps = consumer.offsetsForTimes(timestampsToSearch)
					.entrySet().stream()
					.filter(e -> e.getValue() != null)
					.collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().offset()));

			if (offsetsForTimestamps.isEmpty()) {
				throw new IllegalArgumentException("No offsets were found for requested timestamps");
			}

			consumer.assign(offsetsForTimestamps.keySet());
			offsetsForTimestamps.forEach(consumer::seek);
		}

		private void assignAndSeekFromBeginning(KafkaConsumer<Bytes, Bytes> consumer) {
			List<TopicPartition> partitions = getRequestedPartitions();
			consumer.assign(partitions);
			consumer.seekToBeginning(partitions);
		}
	}
}
