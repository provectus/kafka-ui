package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.TopicMessage;

import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.record.TimestampType;

import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.provectus.kafka.ui.kafka.KafkaConstants.TOPIC_DEFAULT_CONFIGS;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

public class ClusterUtil {

    private static final ZoneId UTC_ZONE_ID = ZoneId.of("UTC");

    public static <T> Mono<T> toMono(KafkaFuture<T> future){
        return Mono.create(sink -> future.whenComplete((res, ex)->{
            if (ex!=null) {
                sink.error(ex);
            } else {
                sink.success(res);
            }
        }));
    }

    public static ConsumerGroup convertToConsumerGroup(ConsumerGroupDescription c, KafkaCluster cluster) {
        ConsumerGroup consumerGroup = new ConsumerGroup();
        consumerGroup.setConsumerGroupId(c.groupId());
        consumerGroup.setNumConsumers(c.members().size());
        int numTopics = c.members().stream().mapToInt( m -> m.assignment().topicPartitions().size()).sum();
        consumerGroup.setNumTopics(numTopics);
        return consumerGroup;
    }

    public static InternalTopicConfig mapToInternalTopicConfig(ConfigEntry configEntry) {
        InternalTopicConfig.InternalTopicConfigBuilder builder = InternalTopicConfig.builder()
                .name(configEntry.name())
                .value(configEntry.value());
        if (configEntry.name().equals(MESSAGE_FORMAT_VERSION_CONFIG)) {
            builder.defaultValue(configEntry.value());
        } else {
            builder.defaultValue(TOPIC_DEFAULT_CONFIGS.get(configEntry.name()));
        }
        return builder.build();
    }

    public static InternalTopic mapToInternalTopic(TopicDescription topicDescription) {
        var topic = InternalTopic.builder();
        topic.internal(topicDescription.isInternal());
        topic.name(topicDescription.name());

        List<InternalPartition> partitions = topicDescription.partitions().stream().map(
                partition -> {
                    var partitionDto = InternalPartition.builder();
                    partitionDto.leader(partition.leader().id());
                    partitionDto.partition(partition.partition());
                    partitionDto.inSyncReplicasCount(partition.isr().size());
                    partitionDto.replicasCount(partition.replicas().size());
                    List<InternalReplica> replicas = partition.replicas().stream().map(
                            r -> new InternalReplica(r.id(), partition.leader().id()!=r.id(), partition.isr().contains(r)))
                            .collect(Collectors.toList());
                    partitionDto.replicas(replicas);
                    return partitionDto.build();
                })
                .collect(Collectors.toList());

        int urpCount = partitions.stream()
                .flatMap(partition -> partition.getReplicas().stream())
                .filter(InternalReplica::isInSync).mapToInt(e -> 1)
                .sum();

        int inSyncReplicasCount = partitions.stream()
                .mapToInt(InternalPartition::getInSyncReplicasCount)
                .sum();

        int replicasCount = partitions.stream()
                .mapToInt(InternalPartition::getReplicasCount)
                .sum();

        topic.partitions(partitions);
        topic.replicas(replicasCount);
        topic.partitionCount(topicDescription.partitions().size());
        topic.inSyncReplicas(inSyncReplicasCount);

        topic.replicationFactor(
                topicDescription.partitions().size() > 0 ?
                        topicDescription.partitions().get(0).replicas().size() : 0
        );

        topic.underReplicatedPartitions(urpCount);

        return topic.build();
    }

    public static TopicMessage mapToTopicMessage(ConsumerRecord<String, String> consumerRecord) {
        OffsetDateTime timestamp = OffsetDateTime.ofInstant(Instant.ofEpochMilli(consumerRecord.timestamp()), UTC_ZONE_ID);
        TopicMessage.TimestampTypeEnum timestampType = mapToTimestampType(consumerRecord.timestampType());
        Map<String, String> headers = new HashMap<>();
        consumerRecord.headers().iterator()
                .forEachRemaining(header -> {
                    headers.put(header.key(), new String(header.value()));
                });


        TopicMessage topicMessage = new TopicMessage();

        topicMessage.setPartition(consumerRecord.partition());
        topicMessage.setOffset(consumerRecord.offset());
        topicMessage.setTimestamp(timestamp);
        topicMessage.setTimestampType(timestampType);
        topicMessage.setKey(consumerRecord.key());
        topicMessage.setHeaders(headers);
        topicMessage.setContent(consumerRecord.value());

        return topicMessage;
    }

    private static TopicMessage.TimestampTypeEnum mapToTimestampType(TimestampType timestampType) {
        switch (timestampType) {
            case CREATE_TIME:
                return TopicMessage.TimestampTypeEnum.CREATE_TIME;
            case LOG_APPEND_TIME:
                return TopicMessage.TimestampTypeEnum.LOG_APPEND_TIME;
            case NO_TIMESTAMP_TYPE:
                return TopicMessage.TimestampTypeEnum.NO_TIMESTAMP_TYPE;
            default:
                throw new IllegalArgumentException("Unknown timestampType: " + timestampType);
        }
    }
}
