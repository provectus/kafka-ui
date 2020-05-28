package com.provectus.kafka.ui.cluster.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import com.provectus.kafka.ui.cluster.model.InternalTopic;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import com.provectus.kafka.ui.kafka.KafkaService;
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

	public Flux<TopicMessage> loadMessages(KafkaCluster cluster, String topic) {
		RecordEmitter emitter = new RecordEmitter(kafkaService, cluster, topic);
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

		public void emit(FluxSink<ConsumerRecord<Bytes, Bytes>> sink) {
			try (KafkaConsumer<Bytes, Bytes> consumer = kafkaService.createConsumer(cluster)) {
				assignPartitions(consumer, topic);
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
			// TODO: seek to requested offsets
			consumer.seekToBeginning(partitions);
		}
	}
}
