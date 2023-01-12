package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.config.KafkaSslConfig;
import com.provectus.kafka.ui.model.ConsumerGroupOrderingDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.InternalTopicConsumerGroup;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.config.SslConfigs;
import org.apache.kafka.common.security.auth.SecurityProtocol;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Service
@RequiredArgsConstructor
public class ConsumerGroupService {

  private final AdminClientService adminClientService;
  private final AccessControlService accessControlService;

  @Autowired
  private final KafkaSslConfig kafkaSslConfig;

  private Mono<List<InternalConsumerGroup>> getConsumerGroups(
      ReactiveAdminClient ac,
      List<ConsumerGroupDescription> descriptions) {
    return Flux.fromIterable(descriptions)
        // 1. getting committed offsets for all groups
        .flatMap(desc -> ac.listConsumerGroupOffsets(desc.groupId())
            .map(offsets -> Tuples.of(desc, offsets)))
        .collectMap(Tuple2::getT1, Tuple2::getT2)
        .flatMap((Map<ConsumerGroupDescription, Map<TopicPartition, Long>> groupOffsetsMap) -> {
          var tpsFromGroupOffsets = groupOffsetsMap.values().stream()
              .flatMap(v -> v.keySet().stream())
              .collect(Collectors.toSet());
          // 2. getting end offsets for partitions with committed offsets
          return ac.listOffsets(tpsFromGroupOffsets, OffsetSpec.latest(), false)
              .map(endOffsets ->
                  descriptions.stream()
                      .map(desc -> {
                        var groupOffsets = groupOffsetsMap.get(desc);
                        var endOffsetsForGroup = new HashMap<>(endOffsets);
                        endOffsetsForGroup.keySet().retainAll(groupOffsets.keySet());
                        // 3. gathering description & offsets
                        return InternalConsumerGroup.create(desc, groupOffsets, endOffsetsForGroup);
                      })
                      .collect(Collectors.toList()));
        });
  }

  public Mono<List<InternalTopicConsumerGroup>> getConsumerGroupsForTopic(KafkaCluster cluster,
                                                                          String topic) {
    return adminClientService.get(cluster)
        // 1. getting topic's end offsets
        .flatMap(ac -> ac.listTopicOffsets(topic, OffsetSpec.latest(), false)
            .flatMap(endOffsets -> {
              var tps = new ArrayList<>(endOffsets.keySet());
              // 2. getting all consumer groups
              return describeConsumerGroups(ac, null)
                  .flatMap((List<ConsumerGroupDescription> groups) ->
                      Flux.fromIterable(groups)
                          // 3. for each group trying to find committed offsets for topic
                          .flatMap(g ->
                              ac.listConsumerGroupOffsets(g.groupId(), tps)
                                  // 4. keeping only groups that relates to topic
                                  .filter(offsets -> isConsumerGroupRelatesToTopic(topic, g, offsets))
                                  // 5. constructing results
                                  .map(offsets -> InternalTopicConsumerGroup.create(topic, g, offsets, endOffsets))
                          ).collectList());
            }));
  }

  private boolean isConsumerGroupRelatesToTopic(String topic,
                                                ConsumerGroupDescription description,
                                                Map<TopicPartition, Long> committedGroupOffsetsForTopic) {
    boolean hasActiveMembersForTopic = description.members()
        .stream()
        .anyMatch(m -> m.assignment().topicPartitions().stream().anyMatch(tp -> tp.topic().equals(topic)));
    boolean hasCommittedOffsets = !committedGroupOffsetsForTopic.isEmpty();
    return hasActiveMembersForTopic || hasCommittedOffsets;
  }

  @Value
  public static class ConsumerGroupsPage {
    List<InternalConsumerGroup> consumerGroups;
    int totalPages;
  }

  public Mono<ConsumerGroupsPage> getConsumerGroupsPage(
      KafkaCluster cluster,
      int page,
      int perPage,
      @Nullable String search,
      ConsumerGroupOrderingDTO orderBy,
      SortOrderDTO sortOrderDto) {
    var comparator = sortOrderDto.equals(SortOrderDTO.ASC)
        ? getPaginationComparator(orderBy)
        : getPaginationComparator(orderBy).reversed();
    return adminClientService.get(cluster).flatMap(ac ->
        describeConsumerGroups(ac, search).flatMap(descriptions ->
            getConsumerGroups(
                ac,
                descriptions.stream()
                    .sorted(comparator)
                    .skip((long) (page - 1) * perPage)
                    .limit(perPage)
                    .collect(Collectors.toList())
            )
                .flatMapMany(Flux::fromIterable)
                .filterWhen(
                    cg -> accessControlService.isConsumerGroupAccessible(cg.getGroupId(), cluster.getName()))
                .collect(Collectors.toList())
                .map(cgs -> new ConsumerGroupsPage(
                    cgs,
                    (descriptions.size() / perPage) + (descriptions.size() % perPage == 0 ? 0 : 1))))
    );
  }

  private Comparator<ConsumerGroupDescription> getPaginationComparator(ConsumerGroupOrderingDTO
                                                                           orderBy) {
    switch (orderBy) {
      case NAME:
        return Comparator.comparing(ConsumerGroupDescription::groupId);
      case STATE:
        ToIntFunction<ConsumerGroupDescription> statesPriorities = cg -> {
          switch (cg.state()) {
            case STABLE:
              return 0;
            case COMPLETING_REBALANCE:
              return 1;
            case PREPARING_REBALANCE:
              return 2;
            case EMPTY:
              return 3;
            case DEAD:
              return 4;
            case UNKNOWN:
              return 5;
            default:
              return 100;
          }
        };
        return Comparator.comparingInt(statesPriorities);
      case MEMBERS:
        return Comparator.comparingInt(cg -> cg.members().size());
      default:
        throw new IllegalStateException("Unsupported order by: " + orderBy);
    }
  }

  private Mono<List<ConsumerGroupDescription>> describeConsumerGroups(ReactiveAdminClient ac,
                                                                      @Nullable String search) {
    return ac.listConsumerGroups()
        .map(groupIds -> groupIds
            .stream()
            .filter(groupId -> search == null || StringUtils.containsIgnoreCase(groupId, search))
            .collect(Collectors.toList()))
        .flatMap(ac::describeConsumerGroups)
        .map(cgs -> new ArrayList<>(cgs.values()));
  }

  public Mono<InternalConsumerGroup> getConsumerGroupDetail(KafkaCluster cluster,
                                                            String consumerGroupId) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.describeConsumerGroups(List.of(consumerGroupId))
            .filter(m -> m.containsKey(consumerGroupId))
            .map(r -> r.get(consumerGroupId))
            .flatMap(descr ->
                getConsumerGroups(ac, List.of(descr))
                    .filter(groups -> !groups.isEmpty())
                    .map(groups -> groups.get(0))));
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
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-ui-consumer-" + System.currentTimeMillis());
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
    props.put(ConsumerConfig.ALLOW_AUTO_CREATE_TOPICS_CONFIG, "false");
    props.putAll(properties);
    props.putAll(this.kafkaSslConfig.getConfigsClientCertificate());
    props.putAll(this.kafkaSslConfig.getConfigsTrustStore());
    props.put(SslConfigs.SSL_PROTOCOL_CONFIG, SecurityProtocol.SSL.name);
    props.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, SecurityProtocol.SSL.name);
    props.put(SslConfigs.SSL_ENDPOINT_IDENTIFICATION_ALGORITHM_CONFIG, "");

    return new KafkaConsumer<>(props);
  }

}
