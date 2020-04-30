package com.provectus.kafka.ui.cluster.util;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ConsumerGroup;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.config.ConfigResource;
import reactor.core.publisher.Mono;

import java.util.HashSet;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

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
        consumerGroup.setClusterId(cluster.getCluster().getId());
        consumerGroup.setConsumerGroupId(c.groupId());
        consumerGroup.setNumConsumers(c.members().size());
        Set<String> topics = new HashSet<>();
        c.members().forEach(s1 -> s1.assignment().topicPartitions().forEach(s2 -> topics.add(s2.topic())));
        consumerGroup.setNumTopics(topics.size());
        return consumerGroup;
    }

    public static void setSupportedCommands(KafkaCluster cluster, Map<ConfigResource, Config> configs) {
        String version = configs.values().stream()
                .map(en -> en.entries().stream()
                        .filter(en1 -> en1.name().contains(CLUSTER_VERSION_PARAM_KEY))
                        .findFirst().orElseThrow())
                .findFirst().orElseThrow().value();
        try {
            cluster.getSupportedCommands().add(Float.parseFloat(version.split("-")[0]) <= 2.3f
                    ? SupportedCommands.ALTER_CONFIGS : SupportedCommands.INCREMENTAL_ALTER_CONFIGS);
        } catch (NoSuchElementException el) {
            log.error("Cluster version param not found {}", cluster.getName());
            throw el;
        } catch (Exception e) {
            log.error("Conversion clusterVersion {} to float value failed", version);
            throw e;
        }
    }
}
