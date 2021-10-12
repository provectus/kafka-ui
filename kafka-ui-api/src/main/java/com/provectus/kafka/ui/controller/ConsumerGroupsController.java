package com.provectus.kafka.ui.controller;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.api.ConsumerGroupsApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDetailsDTO;
import com.provectus.kafka.ui.model.ConsumerGroupOffsetsResetDTO;
import com.provectus.kafka.ui.model.PartitionOffsetDTO;
import com.provectus.kafka.ui.service.ConsumerGroupService;
import com.provectus.kafka.ui.service.OffsetsResetService;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class ConsumerGroupsController extends AbstractController implements ConsumerGroupsApi {

  private final ConsumerGroupService consumerGroupService;
  private final OffsetsResetService offsetsResetService;

  @Override
  public Mono<ResponseEntity<Void>> deleteConsumerGroup(String clusterName, String id,
                                                        ServerWebExchange exchange) {
    return consumerGroupService.deleteConsumerGroupById(getCluster(clusterName), id)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ConsumerGroupDetailsDTO>> getConsumerGroup(
      String clusterName, String consumerGroupId, ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroupDetail(getCluster(clusterName), consumerGroupId)
        .map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getConsumerGroups(String clusterName,
                                                                     ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroups(getCluster(clusterName))
        .map(Flux::fromIterable)
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroupDTO>>> getTopicConsumerGroups(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return consumerGroupService.getConsumerGroups(
        getCluster(clusterName), Optional.of(topicName))
        .map(Flux::fromIterable)
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
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
