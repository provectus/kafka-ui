package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.TopicsApi;
import com.provectus.kafka.ui.model.*;
import com.provectus.kafka.ui.service.ClusterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Log4j2
public class TopicsController implements TopicsApi {
  private final ClusterService clusterService;

  @Override
  public Mono<ResponseEntity<Topic>> createTopic(
      String clusterName, @Valid Mono<TopicFormData> topicFormData, ServerWebExchange exchange) {
    return clusterService.createTopic(clusterName, topicFormData)
        .map(s -> new ResponseEntity<>(s, HttpStatus.OK))
        .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteTopic(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return clusterService.deleteTopic(clusterName, topicName).map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<TopicConfig>>> getTopicConfigs(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return Mono.just(
        clusterService.getTopicConfigs(clusterName, topicName)
            .map(Flux::fromIterable)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build())
    );
  }

  @Override
  public Mono<ResponseEntity<TopicDetails>> getTopicDetails(
      String clusterName, String topicName, ServerWebExchange exchange) {
    return Mono.just(
        clusterService.getTopicDetails(clusterName, topicName)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build())
    );
  }

  @Override
  public Mono<ResponseEntity<TopicsResponse>> getTopics(String clusterName, @Valid Integer page, @Valid Integer perPage, ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(clusterService.getTopics(clusterName, Optional.ofNullable(page), Optional.ofNullable(perPage))));
  }

  @Override
  public Mono<ResponseEntity<Topic>> updateTopic(
      String clusterId, String topicName, @Valid Mono<TopicFormData> topicFormData, ServerWebExchange exchange) {
    return clusterService.updateTopic(clusterId, topicName, topicFormData).map(ResponseEntity::ok);
  }
}
