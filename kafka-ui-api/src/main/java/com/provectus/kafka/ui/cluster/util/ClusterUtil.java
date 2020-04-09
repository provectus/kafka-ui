package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ConsumerDetail;
import com.provectus.kafka.ui.model.ConsumerGroup;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.MemberDescription;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import reactor.core.publisher.Mono;

import java.util.*;
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

    public static ConsumerDetail partlyConvertToConsumerDetail(MemberDescription consumer, String consumerGroupId, KafkaCluster cluster) {
        ConsumerDetail partlyResult = new ConsumerDetail();
        partlyResult.setConsumerId(consumer.consumerId());
        partlyResult.setPartition((consumer.assignment().topicPartitions().stream().map(TopicPartition::partition).collect(Collectors.toList())));
        partlyResult.setTopic((consumer.assignment().topicPartitions().stream().map(TopicPartition::topic).collect(Collectors.toList())));
        partlyResult.setEndOffset(new ArrayList(getEndOffsets(consumer.assignment().topicPartitions(), consumerGroupId, cluster.getBootstrapServers()).values()));
        return partlyResult;
    }

    private static Map<TopicPartition, Long> getEndOffsets(Set<TopicPartition> topicPartition, String groupId, String bootstrapServers) {
        Map<TopicPartition, Long> result;
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(properties)) {
            result = consumer.endOffsets(topicPartition);
        }
        return result;
    }
}
