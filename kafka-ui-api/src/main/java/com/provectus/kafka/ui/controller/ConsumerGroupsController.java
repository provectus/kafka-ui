package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.ConsumerGroupsApi;
import com.provectus.kafka.ui.model.ConsumerGroup;
import com.provectus.kafka.ui.model.ConsumerGroupDetails;
import com.provectus.kafka.ui.service.ClusterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
        .switchIfEmpty(Mono.just(ResponseEntity.notFound()
            .build())); // TODO: check behaviour on cluster not found and empty groups list
  }
}
