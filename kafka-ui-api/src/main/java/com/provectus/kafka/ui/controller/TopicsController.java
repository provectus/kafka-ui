package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.TopicsApi;
import com.provectus.kafka.ui.model.PartitionsIncreaseDTO;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponseDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeResponseDTO;
import com.provectus.kafka.ui.model.TopicColumnsToSortDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.TopicUpdateDTO;
import com.provectus.kafka.ui.model.TopicsResponseDTO;
import com.provectus.kafka.ui.service.TopicsService;
import java.util.Optional;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class TopicsController extends AbstractController implements TopicsApi {
  private final TopicsService topicsService;

  @Override
  public Mono<ResponseEntity<TopicDTO>> createTopic(
      String clusterName, @Valid Mono<TopicCreationDTO> topicCreation, ServerWebExchange exchange) {
    return topicsService.createTopic(getCluster(clusterName), topicCreation)
        .map(s -> new ResponseEntity<>(s, HttpStatus.OK))
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteTopic(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return topicsService.deleteTopic(getCluster(clusterName), topicName).map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<TopicConfigDTO>>> getTopicConfigs(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return Mono.just(
        ResponseEntity.ok(
            Flux.fromIterable(topicsService.getTopicConfigs(getCluster(clusterName), topicName))));
  }

  @Override
  public Mono<ResponseEntity<TopicDetailsDTO>> getTopicDetails(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return Mono.just(
        ResponseEntity.ok(
            topicsService.getTopicDetails(getCluster(clusterName), topicName))
    );
  }

  @Override
  public Mono<ResponseEntity<TopicsResponseDTO>> getTopics(String clusterName, @Valid Integer page,
                                                        @Valid Integer perPage,
                                                        @Valid Boolean showInternal,
                                                        @Valid String search,
                                                        @Valid TopicColumnsToSortDTO orderBy,
                                                        ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(topicsService
        .getTopics(
            getCluster(clusterName),
            Optional.ofNullable(page),
            Optional.ofNullable(perPage),
            Optional.ofNullable(showInternal),
            Optional.ofNullable(search),
            Optional.ofNullable(orderBy)
        )));
  }

  @Override
  public Mono<ResponseEntity<TopicDTO>> updateTopic(
      String clusterId, String topicName, @Valid Mono<TopicUpdateDTO> topicUpdate,
      ServerWebExchange exchange) {
    return topicsService
        .updateTopic(getCluster(clusterId), topicName, topicUpdate).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<PartitionsIncreaseResponseDTO>> increaseTopicPartitions(
      String clusterName, String topicName,
      Mono<PartitionsIncreaseDTO> partitionsIncrease,
      ServerWebExchange exchange) {
    return partitionsIncrease.flatMap(
        partitions ->
            topicsService.increaseTopicPartitions(getCluster(clusterName), topicName, partitions))
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<ReplicationFactorChangeResponseDTO>> changeReplicationFactor(
      String clusterName, String topicName,
      Mono<ReplicationFactorChangeDTO> replicationFactorChange,
      ServerWebExchange exchange) {
    return replicationFactorChange
        .flatMap(rfc ->
            topicsService.changeReplicationFactor(getCluster(clusterName), topicName, rfc))
        .map(ResponseEntity::ok);
  }
}
