package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction.DELETE;
import static com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction.RESET_OFFSETS;
import static com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction.VIEW;
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
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ClusterAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.OffsetsResetService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
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
  private final AccessControlService accessControlService;

  @Value("${consumer.groups.page.size:25}")
  private int defaultConsumerGroupsPageSize;

  @Override
  public Mono<ResponseEntity<Void>> deleteConsumerGroup(String clusterName,
                                                        String id,
                                                        ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .consumerGroup(id)
        .consumerGroupActions(DELETE)
        .build());

    return validateAccess.then(
        consumerGroupService.deleteConsumerGroupById(getCluster(clusterName), id)
            .thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<ConsumerGroupDetailsDTO>> getConsumerGroup(String clusterName,
                                                                        String consumerGroupId,
                                                                        ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .consumerGroup(consumerGroupId)
        .consumerGroupActions(VIEW)
        .build());

    return validateAccess.then(
        consumerGroupService.getConsumerGroupDetail(getCluster(clusterName), consumerGroupId)
            .map(ConsumerGroupMapper::toDetailsDto)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getTopicConsumerGroups(String clusterName,
                                                                             String topicName,
                                                                             ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(TopicAction.VIEW)
        .build());

    Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> job =
        consumerGroupService.getConsumerGroupsForTopic(getCluster(clusterName), topicName)
            .flatMapMany(Flux::fromIterable)
            .filterWhen(cg -> accessControlService.isConsumerGroupAccessible(cg.getGroupId(), clusterName))
            .map(ConsumerGroupMapper::toDto)
            .collectList()
            .map(Flux::fromIterable)
            .map(ResponseEntity::ok)
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));

    return validateAccess.then(job);
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

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        // consumer group access validation is within the service
        .build());

    return validateAccess.then(
        consumerGroupService.getConsumerGroupsPage(
                getCluster(clusterName),
                Optional.ofNullable(page).filter(i -> i > 0).orElse(1),
                Optional.ofNullable(perPage).filter(i -> i > 0).orElse(defaultConsumerGroupsPageSize),
                search,
                Optional.ofNullable(orderBy).orElse(ConsumerGroupOrderingDTO.NAME),
                Optional.ofNullable(sortOrderDto).orElse(SortOrderDTO.ASC)
            )
            .map(this::convertPage)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> resetConsumerGroupOffsets(String clusterName,
                                                              String group,
                                                              Mono<ConsumerGroupOffsetsResetDTO> resetDto,
                                                              ServerWebExchange exchange) {
    return resetDto.flatMap(reset -> {
      Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
          .cluster(clusterName)
          .clusterActions(ClusterAction.VIEW)
          .topic(reset.getTopic())
          .topicActions(TopicAction.VIEW)
          .consumerGroupActions(RESET_OFFSETS)
          .build());

      Supplier<Mono<Void>> mono = () -> {
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
      };

      return validateAccess.then(mono.get());
    }).thenReturn(ResponseEntity.ok().build());
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

}
