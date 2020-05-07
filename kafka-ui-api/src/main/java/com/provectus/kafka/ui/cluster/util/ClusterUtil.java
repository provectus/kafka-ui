package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.*;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.Partition;
import com.provectus.kafka.ui.model.Replica;
import com.provectus.kafka.ui.model.Topic;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.config.ConfigResource;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.kafka.ui.kafka.KafkaConstants.TOPIC_DEFAULT_CONFIGS;
import static org.apache.kafka.common.config.TopicConfig.MESSAGE_FORMAT_VERSION_CONFIG;

@Log4j2
public class ClusterUtil {

    private static final String CLUSTER_VERSION_PARAM_KEY = "inter.broker.protocol.version";

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
        consumerGroup.setClusterId(cluster.getId());
        consumerGroup.setConsumerGroupId(c.groupId());
        consumerGroup.setNumConsumers(c.members().size());
        int numTopics = c.members().stream().mapToInt( m -> m.assignment().topicPartitions().size()).sum();
        consumerGroup.setNumTopics(numTopics);
        return consumerGroup;
    }

    public static Mono<List<ExtendedAdminClient.SupportedFeatures>> getSupportedFeatures(AdminClient adminClient) {
        List<ExtendedAdminClient.SupportedFeatures> supportedFeatures = new ArrayList<>();
        return ClusterUtil.toMono(adminClient.describeCluster().controller())
                .map(Node::id)
                .map(id -> Collections.singletonList(new ConfigResource(ConfigResource.Type.BROKER, id.toString())))
                .flatMap(brokerCR -> ClusterUtil.toMono(adminClient.describeConfigs(brokerCR).all())
                        .map(s -> {
                            supportedFeatures.add(getSupportedUpdateFeature(s));
                            return supportedFeatures;
                        }));
    }

    private static ExtendedAdminClient.SupportedFeatures getSupportedUpdateFeature(Map<ConfigResource, Config> configs) {
        String version = configs.values().stream()
                .map(en -> en.entries().stream()
                        .filter(en1 -> en1.name().contains(CLUSTER_VERSION_PARAM_KEY))
                        .findFirst().orElseThrow())
                .findFirst().orElseThrow().value();
        try {
            return Float.parseFloat(version.split("-")[0]) <= 2.3f
                    ? ExtendedAdminClient.SupportedFeatures.ALTER_CONFIGS : ExtendedAdminClient.SupportedFeatures.INCREMENTAL_ALTER_CONFIGS;
        } catch (Exception e) {
            log.error("Conversion clusterVersion {} to float value failed", version);
            throw e;
        }
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

    public static Topic convertToTopic (InternalTopic internalTopic) {
        Topic topic = new Topic();
        topic.setName(internalTopic.getName());
        List<Partition> partitions = internalTopic.getPartitions().stream().flatMap(s -> {
            Partition partition = new Partition();
            partition.setPartition(s.getPartition());
            partition.setLeader(s.getLeader());
            partition.setReplicas(s.getReplicas().stream().flatMap(r -> {
                Replica replica = new Replica();
                replica.setBroker(r.getBroker());
                return Stream.of(replica);
            }).collect(Collectors.toList()));
            return Stream.of(partition);
        }).collect(Collectors.toList());
        topic.setPartitions(partitions);
        return topic;
    }

}
