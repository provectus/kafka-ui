package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ConsumerGroup;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.common.KafkaFuture;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.Set;

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
}
