package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerTopicPartitionDetail;
import com.provectus.kafka.ui.model.TopicPartitionDto;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.TopicPartition;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class ClusterUtil {

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
        consumerGroup.setClusterId(cluster.getCluster().getId());
        consumerGroup.setConsumerGroupId(c.groupId());
        consumerGroup.setNumConsumers(c.members().size());
        Set<String> topics = new HashSet<>();
        c.members().forEach(s1 -> s1.assignment().topicPartitions().forEach(s2 -> topics.add(s2.topic())));
        consumerGroup.setNumTopics(topics.size());
        return consumerGroup;
    }

    public static List<ConsumerTopicPartitionDetail> convertToConsumerTopicPartitionDetails(
            MemberDescription consumer,
            Map<TopicPartition, OffsetAndMetadata> groupOffsets,
            Map<TopicPartition, Long> endOffsets
    ) {
        return consumer.assignment().topicPartitions().stream()
                .map(tp -> {
                    Long currentOffset = groupOffsets.get(tp).offset();
                    Long endOffset = endOffsets.get(tp);
                    ConsumerTopicPartitionDetail cd = new ConsumerTopicPartitionDetail();
                    cd.setConsumerId(consumer.consumerId());
                    cd.setTopic(tp.topic());
                    cd.setPartition(tp.partition());
                    cd.setCurrentOffset(currentOffset);
                    cd.setEndOffset(endOffset);
                    cd.setMessagesBehind(endOffset - currentOffset);
                    return cd;
                }).collect(Collectors.toList());
    }

    private static TopicPartitionDto toTopicPartitionDto(TopicPartition topicPartition) {
        TopicPartitionDto result = new TopicPartitionDto();
        result.setTopic(topicPartition.topic());
        result.setPartition(topicPartition.partition());
        return result;
    }
}
