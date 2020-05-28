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

import com.provectus.kafka.ui.cluster.model.ConsumerPosition;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.model.PartitionPosition;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
import com.provectus.kafka.ui.model.PositionType;
import com.provectus.kafka.ui.model.TopicMessage;

import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.scheduler.Schedulers;

@Service
@Log4j2
@RequiredArgsConstructor
public class ConsumingService {

	// TODO: make this configurable
	private static final int BATCH_SIZE = 20;

	private final KafkaService kafkaService;

	public Flux<TopicMessage> loadMessages(KafkaCluster cluster, String topic, ConsumerPosition consumerPosition) {
		RecordEmitter emitter = new RecordEmitter(kafkaService, cluster, topic, consumerPosition);
		return Flux.create(emitter::emit)
				.subscribeOn(Schedulers.boundedElastic())
				.map(ClusterUtil::mapToTopicMessage)
				.limitRequest(BATCH_SIZE);
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
				assignPartitions(consumer, topic);
				seekOffsets(consumer, topic, consumerPosition);
				while (!sink.isCancelled()) {
					ConsumerRecords<Bytes, Bytes> records = consumer.poll(POLL_TIMEOUT_MS);
					log.info("{} records polled", records.count());
					records.iterator()
							.forEachRemaining(sink::next);
				}
			} catch (Exception e) {
				log.error("Error occurred while consuming records", e);
				throw new RuntimeException(e);
			}
		}

		private void assignPartitions(KafkaConsumer<Bytes, Bytes> consumer, String topicName) {
			List<TopicPartition> partitions =  Optional.ofNullable(cluster.getTopics().get(topicName))
					.orElseThrow(() -> new IllegalArgumentException("Unknown topic: " + topicName))
					.getPartitions().stream()
					.map(partitionInfo -> new TopicPartition(topicName, partitionInfo.getPartition()))
					.collect(Collectors.toList());

			consumer.assign(partitions);
		}

		private void seekOffsets(KafkaConsumer<Bytes, Bytes> consumer, String topic, ConsumerPosition consumerPosition) {
			PositionType positionType = consumerPosition.getPositionType();
			switch (positionType) {
				case OFFSET:
					consumerPosition.getPartitionPositions().forEach(partitionPosition -> {
						TopicPartition topicPartition = new TopicPartition(topic, partitionPosition.getPartition());
						consumer.seek(topicPartition, partitionPosition.getPosition());
					});
					break;
				case TIMESTAMP:
					Map<TopicPartition, Long> timestampsToSearch = consumerPosition.getPartitionPositions().stream()
							.collect(Collectors.toMap(
									partitionPosition -> new TopicPartition(topic, partitionPosition.getPartition()),
									PartitionPosition::getPosition
							));
					consumer.offsetsForTimes(timestampsToSearch)
							.forEach((topicPartition, offsetAndTimestamp) ->
									consumer.seek(topicPartition, offsetAndTimestamp.offset())
							);
					break;
				case LATEST:
					List<TopicPartition> partitions = consumerPosition.getPartitionPositions().stream()
							.map(partitionPosition -> new TopicPartition(topic, partitionPosition.getPartition()))
							.collect(Collectors.toList());
					Map<TopicPartition, Long> endOffsets = consumer.endOffsets(partitions);
					endOffsets.forEach(((topicPartition, offset) -> consumer.seek(topicPartition, offset - BATCH_SIZE)));
				default:
					throw new IllegalArgumentException("Unknown type of positionType: " + positionType);
			}
		}
	}
}
