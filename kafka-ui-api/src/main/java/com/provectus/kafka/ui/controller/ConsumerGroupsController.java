package com.provectus.kafka.ui.controller;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.api.ConsumerGroupsApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.mapper.ConsumerGroupMapper;
import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDetailsDTO;
import com.provectus.kafka.ui.model.ConsumerGroupOffsetsResetDTO;
import com.provectus.kafka.ui.model.ConsumerGroupOrderingDTO;
import com.provectus.kafka.ui.model.ConsumerGroupsPageResponseDTO;
import com.provectus.kafka.ui.model.PartitionOffsetDTO;
import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.OffsetsResetService;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

  @Value("${consumer.groups.page.size:25}")
  private int defaultConsumerGroupsPageSize;

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
        .map(ConsumerGroupMapper::toDetailsDto)
        .map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getConsumerGroups(String clusterName,
                                                                     ServerWebExchange exchange) {
    return consumerGroupService.getAllConsumerGroups(getCluster(clusterName))
        .map(Flux::fromIterable)
        .map(f -> f.map(ConsumerGroupMapper::toDto))
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getTopicConsumerGroups(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroupsForTopic(getCluster(clusterName), topicName)
        .map(Flux::fromIterable)
        .map(f -> f.map(ConsumerGroupMapper::toDto))
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<ConsumerGroupsPageResponseDTO>> getConsumerGroupsPage(
      String clusterName,
      Integer page,
      Integer perPage,
      String search,
      ConsumerGroupOrderingDTO orderBy,
      SortOrderDTO sortOrderDto,
      ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroupsPage(
            getCluster(clusterName),
            Optional.ofNullable(page).filter(i -> i > 0).orElse(1),
            Optional.ofNullable(perPage).filter(i -> i > 0).orElse(defaultConsumerGroupsPageSize),
            search,
            Optional.ofNullable(orderBy).orElse(ConsumerGroupOrderingDTO.NAME),
            Optional.ofNullable(sortOrderDto).orElse(SortOrderDTO.ASC)
        )
        .map(this::convertPage)
        .map(ResponseEntity::ok);
  }

  private ConsumerGroupsPageResponseDTO convertPage(ConsumerGroupService.ConsumerGroupsPage
                                                    consumerGroupConsumerGroupsPage) {
    return new ConsumerGroupsPageResponseDTO()
        .pageCount(consumerGroupConsumerGroupsPage.getTotalPages())
        .consumerGroups(consumerGroupConsumerGroupsPage.getConsumerGroups()
            .stream()
            .map(ConsumerGroupMapper::toDto)
            .collect(Collectors.toList()));
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
