package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDetailsDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@Service
@RequiredArgsConstructor
public class ConsumerGroupService {

  private final AdminClientService adminClientService;

  private Mono<List<InternalConsumerGroup>> getConsumerGroupsInternal(KafkaCluster cluster) {
    return adminClientService.get(cluster).flatMap(ac ->
        ac.listConsumerGroups()
            .flatMap(groupIds -> getConsumerGroupsInternal(cluster, groupIds)));
  }

  private Mono<List<InternalConsumerGroup>> getConsumerGroupsInternal(KafkaCluster cluster,
                                                                     List<String> groupIds) {
    return adminClientService.get(cluster).flatMap(ac ->
        ac.describeConsumerGroups(groupIds)
            .map(Map::values)
            .flatMap(descriptions ->
                Flux.fromIterable(descriptions)
                    .parallel()
                    .flatMap(d ->
                        ac.listConsumerGroupOffsets(d.groupId())
                            .map(offsets -> ClusterUtil.convertToInternalConsumerGroup(d, offsets))
                    )
                    .sequential()
                    .collectList()));
  }

  public Mono<List<InternalConsumerGroup>> getConsumerGroups(
      KafkaCluster cluster, Optional<String> topic, List<String> groupIds) {
    final Mono<List<InternalConsumerGroup>> consumerGroups;

    if (groupIds.isEmpty()) {
      consumerGroups = getConsumerGroupsInternal(cluster);
    } else {
      consumerGroups = getConsumerGroupsInternal(cluster, groupIds);
    }

    return consumerGroups.map(c ->
        c.stream()
            .map(d -> ClusterUtil.filterConsumerGroupTopic(d, topic))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(g ->
                g.toBuilder().endOffsets(
                    topicPartitionsEndOffsets(cluster, g.getOffsets().keySet())
                ).build()
            )
            .collect(Collectors.toList())
    );
  }

  public Mono<List<ConsumerGroupDTO>> getConsumerGroups(KafkaCluster cluster) {
    return getConsumerGroups(cluster, Optional.empty());
  }

  public Mono<List<ConsumerGroupDTO>> getConsumerGroups(KafkaCluster cluster,
                                                        Optional<String> topic) {
    return getConsumerGroups(cluster, topic, Collections.emptyList())
        .map(c ->
            c.stream().map(ClusterUtil::convertToConsumerGroup).collect(Collectors.toList())
        );
  }

  private Map<TopicPartition, Long> topicPartitionsEndOffsets(
      KafkaCluster cluster, Collection<TopicPartition> topicPartitions) {
    try (KafkaConsumer<Bytes, Bytes> consumer = createConsumer(cluster)) {
      return consumer.endOffsets(topicPartitions);
    }
  }

  public Mono<ConsumerGroupDetailsDTO> getConsumerGroupDetail(KafkaCluster cluster,
                                                              String consumerGroupId) {
    return getConsumerGroups(
        cluster,
        Optional.empty(),
        Collections.singletonList(consumerGroupId)
    ).filter(groups -> !groups.isEmpty()).map(groups -> groups.get(0)).map(
        ClusterUtil::convertToConsumerGroupDetails
    );
  }

  public Mono<Void> deleteConsumerGroupById(KafkaCluster cluster,
                                            String groupId) {
    return adminClientService.get(cluster)
        .flatMap(adminClient -> adminClient.deleteConsumerGroups(List.of(groupId)));
  }

  public KafkaConsumer<Bytes, Bytes> createConsumer(KafkaCluster cluster) {
    return createConsumer(cluster, Map.of());
  }

  public KafkaConsumer<Bytes, Bytes> createConsumer(KafkaCluster cluster,
                                                    Map<String, Object> properties) {
    Properties props = new Properties();
    props.putAll(cluster.getProperties());
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-ui-" + UUID.randomUUID());
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.putAll(properties);

    return new KafkaConsumer<>(props);
  }

}
