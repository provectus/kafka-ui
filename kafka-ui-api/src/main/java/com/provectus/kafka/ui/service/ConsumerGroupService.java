package com.provectus.kafka.ui.service;

import com.google.common.collect.Streams;
import com.google.common.collect.Table;
import com.provectus.kafka.ui.emitter.EnhancedConsumer;
import com.provectus.kafka.ui.model.ConsumerGroupOrderingDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.InternalTopicConsumerGroup;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import com.provectus.kafka.ui.util.ApplicationMetrics;
import com.provectus.kafka.ui.util.SslPropertiesUtil;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.ConsumerGroupState;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ConsumerGroupService {

  private final AdminClientService adminClientService;
  private final AccessControlService accessControlService;

  private Mono<List<InternalConsumerGroup>> getConsumerGroups(
      ReactiveAdminClient ac,
      List<ConsumerGroupDescription> descriptions) {
    var groupNames = descriptions.stream().map(ConsumerGroupDescription::groupId).toList();
    // 1. getting committed offsets for all groups
    return ac.listConsumerGroupOffsets(groupNames, null)
        .flatMap((Table<String, TopicPartition, Long> committedOffsets) -> {
          // 2. getting end offsets for partitions with committed offsets
          return ac.listOffsets(committedOffsets.columnKeySet(), OffsetSpec.latest(), false)
              .map(endOffsets ->
                  descriptions.stream()
                      .map(desc -> {
                        var groupOffsets = committedOffsets.row(desc.groupId());
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
              return describeConsumerGroups(ac)
                  .flatMap((List<ConsumerGroupDescription> groups) -> {
                        // 3. trying to find committed offsets for topic
                        var groupNames = groups.stream().map(ConsumerGroupDescription::groupId).toList();
                        return ac.listConsumerGroupOffsets(groupNames, tps).map(offsets ->
                            groups.stream()
                                // 4. keeping only groups that relates to topic
                                .filter(g -> isConsumerGroupRelatesToTopic(topic, g, offsets.containsRow(g.groupId())))
                                .map(g ->
                                    // 5. constructing results
                                    InternalTopicConsumerGroup.create(topic, g, offsets.row(g.groupId()), endOffsets))
                                .toList()
                        );
                      }
                  );
            }));
  }

  private boolean isConsumerGroupRelatesToTopic(String topic,
                                                ConsumerGroupDescription description,
                                                boolean hasCommittedOffsets) {
    boolean hasActiveMembersForTopic = description.members()
        .stream()
        .anyMatch(m -> m.assignment().topicPartitions().stream().anyMatch(tp -> tp.topic().equals(topic)));
    return hasActiveMembersForTopic || hasCommittedOffsets;
  }

  public record ConsumerGroupsPage(List<InternalConsumerGroup> consumerGroups, int totalPages) {
  }

  private record GroupWithDescr(InternalConsumerGroup icg, ConsumerGroupDescription cgd) {
  }

  public Mono<ConsumerGroupsPage> getConsumerGroupsPage(
      KafkaCluster cluster,
      int pageNum,
      int perPage,
      @Nullable String search,
      ConsumerGroupOrderingDTO orderBy,
      SortOrderDTO sortOrderDto) {
    return adminClientService.get(cluster).flatMap(ac ->
        ac.listConsumerGroups()
            .map(listing -> search == null
                ? listing
                : listing.stream()
                .filter(g -> StringUtils.containsIgnoreCase(g.groupId(), search))
                .toList()
            )
            .flatMapIterable(lst -> lst)
            .filterWhen(cg -> accessControlService.isConsumerGroupAccessible(cg.groupId(), cluster.getName()))
            .collectList()
            .flatMap(allGroups ->
                loadSortedDescriptions(ac, allGroups, pageNum, perPage, orderBy, sortOrderDto)
                    .flatMap(descriptions -> getConsumerGroups(ac, descriptions)
                        .map(page -> new ConsumerGroupsPage(
                            page,
                            (allGroups.size() / perPage) + (allGroups.size() % perPage == 0 ? 0 : 1))))));
  }

  private Mono<List<ConsumerGroupDescription>> loadSortedDescriptions(ReactiveAdminClient ac,
                                                                      List<ConsumerGroupListing> groups,
                                                                      int pageNum,
                                                                      int perPage,
                                                                      ConsumerGroupOrderingDTO orderBy,
                                                                      SortOrderDTO sortOrderDto) {
    return switch (orderBy) {
      case NAME -> {
        Comparator<ConsumerGroupListing> comparator = Comparator.comparing(ConsumerGroupListing::groupId);
        yield loadDescriptionsByListings(ac, groups, comparator, pageNum, perPage, sortOrderDto);
      }
      case STATE -> {
        ToIntFunction<ConsumerGroupListing> statesPriorities =
            cg -> switch (cg.state().orElse(ConsumerGroupState.UNKNOWN)) {
              case STABLE -> 0;
              case COMPLETING_REBALANCE -> 1;
              case PREPARING_REBALANCE -> 2;
              case EMPTY -> 3;
              case DEAD -> 4;
              case UNKNOWN -> 5;
            };
        var comparator = Comparator.comparingInt(statesPriorities);
        yield loadDescriptionsByListings(ac, groups, comparator, pageNum, perPage, sortOrderDto);
      }
      case MEMBERS -> {
        var comparator = Comparator.<ConsumerGroupDescription>comparingInt(cg -> cg.members().size());
        var groupNames = groups.stream().map(ConsumerGroupListing::groupId).toList();
        yield ac.describeConsumerGroups(groupNames)
            .map(descriptions ->
                sortAndPaginate(descriptions.values(), comparator, pageNum, perPage, sortOrderDto).toList());
      }
      case MESSAGES_BEHIND -> {

        Comparator<GroupWithDescr> comparator = Comparator.comparingLong(gwd ->
            gwd.icg.getConsumerLag() == null ? 0L : gwd.icg.getConsumerLag());

        yield loadDescriptionsByInternalConsumerGroups(ac, groups, comparator, pageNum, perPage, sortOrderDto);
      }

      case TOPIC_NUM -> {

        Comparator<GroupWithDescr> comparator = Comparator.comparingInt(gwd -> gwd.icg.getTopicNum());

        yield loadDescriptionsByInternalConsumerGroups(ac, groups, comparator, pageNum, perPage, sortOrderDto);

      }
    };
  }

  private Mono<List<ConsumerGroupDescription>> loadDescriptionsByListings(ReactiveAdminClient ac,
                                                                          List<ConsumerGroupListing> listings,
                                                                          Comparator<ConsumerGroupListing> comparator,
                                                                          int pageNum,
                                                                          int perPage,
                                                                          SortOrderDTO sortOrderDto) {
    List<String> sortedGroups = sortAndPaginate(listings, comparator, pageNum, perPage, sortOrderDto)
        .map(ConsumerGroupListing::groupId)
        .toList();
    return ac.describeConsumerGroups(sortedGroups)
        .map(descrMap -> sortedGroups.stream().map(descrMap::get).toList());
  }

  private <T> Stream<T> sortAndPaginate(Collection<T> collection,
                                        Comparator<T> comparator,
                                        int pageNum,
                                        int perPage,
                                        SortOrderDTO sortOrderDto) {
    return collection.stream()
        .sorted(sortOrderDto == SortOrderDTO.ASC ? comparator : comparator.reversed())
        .skip((long) (pageNum - 1) * perPage)
        .limit(perPage);
  }

  private Mono<List<ConsumerGroupDescription>> describeConsumerGroups(ReactiveAdminClient ac) {
    return ac.listConsumerGroupNames()
        .flatMap(ac::describeConsumerGroups)
        .map(cgs -> new ArrayList<>(cgs.values()));
  }


  private Mono<List<ConsumerGroupDescription>> loadDescriptionsByInternalConsumerGroups(ReactiveAdminClient ac,
                                                                                  List<ConsumerGroupListing> groups,
                                                                                  Comparator<GroupWithDescr> comparator,
                                                                                  int pageNum,
                                                                                  int perPage,
                                                                                  SortOrderDTO sortOrderDto) {
    var groupNames = groups.stream().map(ConsumerGroupListing::groupId).toList();

    return ac.describeConsumerGroups(groupNames)
        .flatMap(descriptionsMap -> {
              List<ConsumerGroupDescription> descriptions = descriptionsMap.values().stream().toList();
              return getConsumerGroups(ac, descriptions)
                  .map(icg -> Streams.zip(icg.stream(), descriptions.stream(), GroupWithDescr::new).toList())
                  .map(gwd -> sortAndPaginate(gwd, comparator, pageNum, perPage, sortOrderDto)
                      .map(GroupWithDescr::cgd).toList());
            }
        );

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

  public EnhancedConsumer createConsumer(KafkaCluster cluster) {
    return createConsumer(cluster, Map.of());
  }

  public EnhancedConsumer createConsumer(KafkaCluster cluster,
                                         Map<String, Object> properties) {
    Properties props = new Properties();
    SslPropertiesUtil.addKafkaSslProperties(cluster.getOriginalProperties().getSsl(), props);
    props.putAll(cluster.getProperties());
    props.put(ConsumerConfig.CLIENT_ID_CONFIG, "kafka-ui-consumer-" + System.currentTimeMillis());
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
    props.put(ConsumerConfig.ALLOW_AUTO_CREATE_TOPICS_CONFIG, "false");
    props.putAll(properties);

    return new EnhancedConsumer(
        props,
        cluster.getPollingSettings().getPollingThrottler(),
        ApplicationMetrics.forCluster(cluster)
    );
  }

}
