package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.InternalTopic;
import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.Partition;
import com.provectus.kafka.ui.model.Replica;
import com.provectus.kafka.ui.model.Topic;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.common.KafkaFuture;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

    public static List<Topic> convertToExternalTopicList(List<InternalTopic> internalTopics) {
        return internalTopics.stream().flatMap(s -> Stream.of(convertToExternalTopic(s))).collect(Collectors.toList());
    }

    public static Topic convertToExternalTopic(InternalTopic internalTopic) {
        Topic topic = new Topic();
        topic.setName(internalTopic.getName());
        topic.setPartitions(internalTopic.getPartitions().stream().flatMap(s -> {
            Partition partition = new Partition();
            partition.setLeader(s.getLeader());
            partition.setPartition(s.getPartition());
            partition.setReplicas(s.getReplicas().stream().flatMap(r -> {
                Replica replica = new Replica();
                replica.setBroker(r.getBroker());
                replica.setInSync(r.isInSync());
                replica.setLeader(r.isLeader());
                return Stream.of(replica);
            }).collect(Collectors.toList()));
            return Stream.of(partition);
        }).collect(Collectors.toList()));
        return topic;
    }
}
