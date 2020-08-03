package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.deserialization.RecordDeserializer;
import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.model.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.config.ConfigResource;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.kafka.ui.kafka.KafkaConstants.TOPIC_DEFAULT_CONFIGS;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

@Slf4j
public class ClusterUtil {

    private static final String CLUSTER_VERSION_PARAM_KEY = "inter.broker.protocol.version";

    private static final ZoneId UTC_ZONE_ID = ZoneId.of("UTC");

    public static <T> Mono<T> toMono(KafkaFuture<T> future) {
        return Mono.create(sink -> future.whenComplete((res, ex) -> {
            if (ex != null) {
                sink.error(ex);
            } else {
                sink.success(res);
            }
        }));
    }

    public static Mono<String> toMono(KafkaFuture<Void> future, String topicName) {
        return Mono.create(sink -> future.whenComplete((res, ex) -> {
            if (ex != null) {
                sink.error(ex);
            } else {
                sink.success(topicName);
            }
        }));
    }

    public static ConsumerGroup convertToConsumerGroup(ConsumerGroupDescription c) {
        ConsumerGroup consumerGroup = new ConsumerGroup();
        consumerGroup.setConsumerGroupId(c.groupId());
        consumerGroup.setNumConsumers(c.members().size());
        int numTopics = c.members().stream().flatMap(m -> m.assignment().topicPartitions().stream().flatMap(t -> Stream.of(t.topic()))).collect(Collectors.toSet()).size();
        consumerGroup.setNumTopics(numTopics);
        return consumerGroup;
    }

    public static List<ConsumerTopicPartitionDetail> convertToConsumerTopicPartitionDetails(
            MemberDescription consumer,
            Map<TopicPartition, OffsetAndMetadata> groupOffsets,
            Map<TopicPartition, Long> endOffsets
    ) {
        return consumer.assignment().topicPartitions().stream()
                .map(tp -> {
                    Long currentOffset = Optional.ofNullable(
                            groupOffsets.get(tp)).map(o -> o.offset()).orElse(0L);
                    Long endOffset = Optional.ofNullable(endOffsets.get(tp)).orElse(0L);
                    ConsumerTopicPartitionDetail cd = new ConsumerTopicPartitionDetail();
                    cd.setConsumerId(consumer.consumerId());
                    cd.setHost(consumer.host());
                    cd.setTopic(tp.topic());
                    cd.setPartition(tp.partition());
                    cd.setCurrentOffset(currentOffset);
                    cd.setEndOffset(endOffset);
                    cd.setMessagesBehind(endOffset - currentOffset);
                    return cd;
                }).collect(Collectors.toList());
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
                            r -> new InternalReplica(r.id(), partition.leader().id() != r.id(), partition.isr().contains(r)))
                            .collect(Collectors.toList());
                    partitionDto.replicas(replicas);
                    return partitionDto.build();
                })
                .collect(Collectors.toList());

        int urpCount = partitions.stream()
                .flatMap(partition -> partition.getReplicas().stream())
                .filter(p -> !p.isInSync()).mapToInt(e -> 1)
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

    public static int convertToIntServerStatus(ServerStatus serverStatus) {
        return serverStatus.equals(ServerStatus.ONLINE) ? 1 : 0;
    }

    public static TopicMessage mapToTopicMessage(ConsumerRecord<Bytes, Bytes> consumerRecord, RecordDeserializer recordDeserializer) {
        OffsetDateTime timestamp = OffsetDateTime.ofInstant(Instant.ofEpochMilli(consumerRecord.timestamp()), UTC_ZONE_ID);
        TopicMessage.TimestampTypeEnum timestampType = mapToTimestampType(consumerRecord.timestampType());
        Map<String, String> headers = new HashMap<>();
        consumerRecord.headers().iterator()
                .forEachRemaining(header -> headers.put(header.key(), new String(header.value())));

        TopicMessage topicMessage = new TopicMessage();

        topicMessage.setPartition(consumerRecord.partition());
        topicMessage.setOffset(consumerRecord.offset());
        topicMessage.setTimestamp(timestamp);
        topicMessage.setTimestampType(timestampType);
        if (consumerRecord.key() != null) {
            topicMessage.setKey(consumerRecord.key().toString());
        }
        topicMessage.setHeaders(headers);
        Object parsedValue = recordDeserializer.deserialize(consumerRecord);
        topicMessage.setContent(parsedValue);

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

    public static Mono<Set<ExtendedAdminClient.SupportedFeature>> getSupportedFeatures(AdminClient adminClient) {
        return ClusterUtil.toMono(adminClient.describeCluster().controller())
                .map(Node::id)
                .map(id -> Collections.singletonList(new ConfigResource(ConfigResource.Type.BROKER, id.toString())))
                .map(brokerCR -> adminClient.describeConfigs(brokerCR).all())
                .flatMap(ClusterUtil::toMono)
                .map(ClusterUtil::getSupportedUpdateFeature)
                .map(Collections::singleton);
    }

    private static ExtendedAdminClient.SupportedFeature getSupportedUpdateFeature(Map<ConfigResource, Config> configs) {
        String version = configs.values().stream()
                .map(Config::entries)
                .flatMap(Collection::stream)
                .filter(entry -> entry.name().contains(CLUSTER_VERSION_PARAM_KEY))
                .findFirst().orElseThrow().value();
        try {
            final String[] parts = version.split("\\.");
            if (parts.length>2) {
              version = parts[0] + "." + parts[1];
            }        
            return Float.parseFloat(version.split("-")[0]) <= 2.3f
                    ? ExtendedAdminClient.SupportedFeature.ALTER_CONFIGS : ExtendedAdminClient.SupportedFeature.INCREMENTAL_ALTER_CONFIGS;
        } catch (Exception e) {
            log.error("Conversion clusterVersion {} to float value failed", version);
            throw e;
        }
    }

    public static <T, R> Map<T, R> toSingleMap (Stream<Map<T, R>> streamOfMaps) {
        return streamOfMaps.reduce((map1, map2) -> Stream.concat(map1.entrySet().stream(), map2.entrySet().stream())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))).orElseThrow();
    }

}
