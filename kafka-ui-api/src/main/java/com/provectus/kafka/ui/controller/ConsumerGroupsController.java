package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.ConsumerGroupsApi;
import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.model.ConsumerGroupOffsetsReset;
import com.provectus.kafka.ui.model.TopicConsumerGroups;
import com.provectus.kafka.ui.service.ClusterService;
import com.provectus.kafka.ui.service.ClustersStorage;
import com.provectus.kafka.ui.service.OffsetsResetService;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class ConsumerGroupsController implements ConsumerGroupsApi {
  private final ClusterService clusterService;
  private final OffsetsResetService offsetsResetService;
  private final ClustersStorage clustersStorage;

  @Override
  public Mono<ResponseEntity<Void>> deleteConsumerGroup(String clusterName, String id,
                                                        ServerWebExchange exchange) {
    return clusterService.deleteConsumerGroupById(clusterName, id)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ConsumerGroupDetails>> getConsumerGroup(
      String clusterName, String consumerGroupId, ServerWebExchange exchange) {
    return clusterService.getConsumerGroupDetail(clusterName, consumerGroupId)
        .map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<ConsumerGroup>>> getConsumerGroups(String clusterName,
                                                                     ServerWebExchange exchange) {
    return clusterService.getConsumerGroups(clusterName)
        .map(Flux::fromIterable)
        .map(ResponseEntity::ok)
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<TopicConsumerGroups>> getTopicConsumerGroups(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return clusterService.getTopicConsumerGroupDetail(clusterName, topicName)
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Void>> resetConsumerGroupOffsets(String clusterName, String group,
                                                              Mono<ConsumerGroupOffsetsReset>
                                                                  consumerGroupOffsetsReset,
                                                              ServerWebExchange exchange) {
    return consumerGroupOffsetsReset.map(reset -> {
      var cluster =
          clustersStorage.getClusterByName(clusterName).orElseThrow(ClusterNotFoundException::new);

      switch (reset.getResetType()) {
        case EARLIEST:
          offsetsResetService
              .resetToEarliest(cluster, group, reset.getTopic(), reset.getPartitions());
          break;
        case LATEST:
          offsetsResetService
              .resetToLatest(cluster, group, reset.getTopic(), reset.getPartitions());
          break;
        case TIMESTAMP:
          offsetsResetService
              .resetToTimestamp(cluster, group, reset.getTopic(), reset.getPartitions(),
                  reset.getResetToTimestamp().longValue());
          break;
        case OFFSET:
          offsetsResetService.resetToOffsets(cluster, group, reset.getTopic(),
              reset.getPartitionsOffsets().stream().map(p -> {
                String[] split = p.split("::");
                if (split.length != 2) {
                  throw new IllegalArgumentException(
                      "Wrong seekTo argument format. See API docs for details");
                }
                return Pair.of(Integer.parseInt(split[0]), Long.parseLong(split[1]));
              }).collect(Collectors.toMap(Pair::getKey, Pair::getValue)));
          break;
        default:
          throw new ValidationException("Unknown resetType " + reset.getResetType());
      }
      return ResponseEntity.ok().build();
    });
  }

}
