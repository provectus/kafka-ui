package com.provectus.kafka.ui.controller;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.api.ConsumerGroupsApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDetailsDTO;
import com.provectus.kafka.ui.model.ConsumerGroupOffsetsResetDTO;
import com.provectus.kafka.ui.model.ConsumerGroupOrderingDTO;
import com.provectus.kafka.ui.model.ConsumerGroupStateDTO;
import com.provectus.kafka.ui.model.ConsumerGroupTopicPartitionDTO;
import com.provectus.kafka.ui.model.ConsumerGroupsPageResponseDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.PartitionOffsetDTO;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.OffsetsResetService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ConsumerGroupsController extends AbstractController implements ConsumerGroupsApi {

  private final ConsumerGroupService consumerGroupService;
  private final OffsetsResetService offsetsResetService;

  @Override
  public Mono<ResponseEntity<Void>> deleteConsumerGroup(String clusterName, String id,
                                                        ServerWebExchange exchange) {
    return consumerGroupService.deleteConsumerGroupById(getCluster(clusterName), id)
        .thenReturn(ResponseEntity.ok().build());
  }

  @Override
  public Mono<ResponseEntity<ConsumerGroupDetailsDTO>> getConsumerGroup(
      String clusterName, String consumerGroupId, ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroupDetail(getCluster(clusterName), consumerGroupId)
        .map(this::convertToConsumerGroupDetails)
        .map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getConsumerGroups(String clusterName,
                                                                     ServerWebExchange exchange) {
    return consumerGroupService.getAllConsumerGroups(getCluster(clusterName))
        .map(Flux::fromIterable)
        .map(f -> f.map(this::convertToConsumerGroup))
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getTopicConsumerGroups(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroupsForTopic(getCluster(clusterName), topicName)
        .map(Flux::fromIterable)
        .map(f -> f.map(this::convertToConsumerGroup))
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<ConsumerGroupsPageResponseDTO>> getTopicConsumerGroupsPaged(
      String clusterName,
      Integer page,
      Integer perPage,
      String search,
      ConsumerGroupOrderingDTO orderBy,
      ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroupsPage(
            getCluster(clusterName),
            Optional.ofNullable(page).filter(i -> i > 0).orElse(1),
            Optional.ofNullable(perPage).filter(i -> i > 0).orElse(25),
            search,
            Optional.ofNullable(orderBy).orElse(ConsumerGroupOrderingDTO.NAME)
        )
        .map(this::mapPage)
        .map(ResponseEntity::ok);
  }

  private ConsumerGroupsPageResponseDTO mapPage(ConsumerGroupService.ConsumerGroupsPage
                                                    consumerGroupConsumerGroupsPage) {
    return new ConsumerGroupsPageResponseDTO()
        .pageCount(consumerGroupConsumerGroupsPage.getTotalPages())
        .topics(consumerGroupConsumerGroupsPage.getConsumerGroups()
            .stream()
            .map(this::convertToConsumerGroup)
            .collect(Collectors.toList()));
  }

  private ConsumerGroupDTO convertToConsumerGroup(InternalConsumerGroup c) {
    return convertToConsumerGroup(c, new ConsumerGroupDTO());
  }

  private <T extends ConsumerGroupDTO> T convertToConsumerGroup(
      InternalConsumerGroup c, T consumerGroup) {
    consumerGroup.setGroupId(c.getGroupId());
    consumerGroup.setMembers(c.getMembers().size());

    int numTopics = Stream.concat(
        c.getOffsets().keySet().stream().map(TopicPartition::topic),
        c.getMembers().stream()
            .flatMap(m -> m.getAssignment().stream().map(TopicPartition::topic))
    ).collect(Collectors.toSet()).size();

    long messagesBehind = c.getOffsets().entrySet().stream()
        .mapToLong(e ->
            Optional.ofNullable(c.getEndOffsets())
                .map(o -> o.get(e.getKey()))
                .map(o -> o - e.getValue())
                .orElse(0L)
        ).sum();

    consumerGroup.setMessagesBehind(messagesBehind);
    consumerGroup.setTopics(numTopics);
    consumerGroup.setSimple(c.isSimple());

    Optional.ofNullable(c.getState())
        .ifPresent(s -> consumerGroup.setState(mapConsumerGroupState(s)));
    Optional.ofNullable(c.getCoordinator())
        .ifPresent(cd -> consumerGroup.setCoordinator(mapCoordinator(cd)));

    consumerGroup.setPartitionAssignor(c.getPartitionAssignor());
    return consumerGroup;
  }

  private ConsumerGroupDetailsDTO convertToConsumerGroupDetails(InternalConsumerGroup g) {
    ConsumerGroupDetailsDTO details = convertToConsumerGroup(g, new ConsumerGroupDetailsDTO());
    Map<TopicPartition, ConsumerGroupTopicPartitionDTO> partitionMap = new HashMap<>();

    for (Map.Entry<TopicPartition, Long> entry : g.getOffsets().entrySet()) {
      ConsumerGroupTopicPartitionDTO partition = new ConsumerGroupTopicPartitionDTO();
      partition.setTopic(entry.getKey().topic());
      partition.setPartition(entry.getKey().partition());
      partition.setCurrentOffset(entry.getValue());

      final Optional<Long> endOffset = Optional.ofNullable(g.getEndOffsets())
          .map(o -> o.get(entry.getKey()));

      final Long behind = endOffset.map(o -> o - entry.getValue())
          .orElse(0L);

      partition.setEndOffset(endOffset.orElse(0L));
      partition.setMessagesBehind(behind);

      partitionMap.put(entry.getKey(), partition);
    }

    for (InternalConsumerGroup.InternalMember member : g.getMembers()) {
      for (TopicPartition topicPartition : member.getAssignment()) {
        final ConsumerGroupTopicPartitionDTO partition = partitionMap.computeIfAbsent(
            topicPartition,
            (tp) -> new ConsumerGroupTopicPartitionDTO()
                .topic(tp.topic())
                .partition(tp.partition())
        );
        partition.setHost(member.getHost());
        partition.setConsumerId(member.getConsumerId());
        partitionMap.put(topicPartition, partition);
      }
    }
    details.setPartitions(new ArrayList<>(partitionMap.values()));
    return details;
  }

  private static BrokerDTO mapCoordinator(Node node) {
    return new BrokerDTO().host(node.host()).id(node.id());
  }

  private static ConsumerGroupStateDTO mapConsumerGroupState(
      org.apache.kafka.common.ConsumerGroupState state) {
    switch (state) {
      case DEAD: return ConsumerGroupStateDTO.DEAD;
      case EMPTY: return ConsumerGroupStateDTO.EMPTY;
      case STABLE: return ConsumerGroupStateDTO.STABLE;
      case PREPARING_REBALANCE: return ConsumerGroupStateDTO.PREPARING_REBALANCE;
      case COMPLETING_REBALANCE: return ConsumerGroupStateDTO.COMPLETING_REBALANCE;
      default: return ConsumerGroupStateDTO.UNKNOWN;
    }
  }

  @Override
  public Mono<ResponseEntity<Void>> resetConsumerGroupOffsets(String clusterName, String group,
                                                              Mono<ConsumerGroupOffsetsResetDTO>
                                                                  consumerGroupOffsetsReset,
                                                              ServerWebExchange exchange) {
    return consumerGroupOffsetsReset.flatMap(reset -> {
      var cluster = getCluster(clusterName);
      switch (reset.getResetType()) {
        case EARLIEST:
          return offsetsResetService
              .resetToEarliest(cluster, group, reset.getTopic(), reset.getPartitions());
        case LATEST:
          return offsetsResetService
              .resetToLatest(cluster, group, reset.getTopic(), reset.getPartitions());
        case TIMESTAMP:
          if (reset.getResetToTimestamp() == null) {
            return Mono.error(
                new ValidationException(
                    "resetToTimestamp is required when TIMESTAMP reset type used"
                )
            );
          }
          return offsetsResetService
              .resetToTimestamp(cluster, group, reset.getTopic(), reset.getPartitions(),
                  reset.getResetToTimestamp());
        case OFFSET:
          if (CollectionUtils.isEmpty(reset.getPartitionsOffsets())) {
            return Mono.error(
                new ValidationException(
                    "partitionsOffsets is required when OFFSET reset type used"
                )
            );
          }
          Map<Integer, Long> offsets = reset.getPartitionsOffsets().stream()
              .collect(toMap(PartitionOffsetDTO::getPartition, PartitionOffsetDTO::getOffset));
          return offsetsResetService.resetToOffsets(cluster, group, reset.getTopic(), offsets);
        default:
          return Mono.error(
              new ValidationException("Unknown resetType " + reset.getResetType())
          );
      }
    }).thenReturn(ResponseEntity.ok().build());
  }

}
