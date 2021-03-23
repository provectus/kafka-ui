package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.MessagesApi;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.SeekType;
import com.provectus.kafka.ui.model.TopicMessage;
import com.provectus.kafka.ui.service.ClusterService;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import javax.validation.Valid;
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
public class MessagesController implements MessagesApi {
  private final ClusterService clusterService;

  @Override
  public Mono<ResponseEntity<Void>> deleteTopicMessages(
      String clusterName, String topicName, @Valid List<Integer> partitions,
      ServerWebExchange exchange) {
    return clusterService.deleteTopicMessages(
        clusterName,
        topicName,
        Optional.ofNullable(partitions).orElse(List.of())
    ).map(ResponseEntity::ok);
  }


  @Override
  public Mono<ResponseEntity<Flux<TopicMessage>>> getTopicMessages(
      String clusterName, String topicName, @Valid SeekType seekType, @Valid List<String> seekTo,
      @Valid Integer limit, @Valid String q, ServerWebExchange exchange) {
    return parseConsumerPosition(seekType, seekTo)
        .map(consumerPosition -> ResponseEntity
            .ok(clusterService.getMessages(clusterName, topicName, consumerPosition, q, limit)));
  }

  private Mono<ConsumerPosition> parseConsumerPosition(SeekType seekType, List<String> seekTo) {
    return Mono.justOrEmpty(seekTo)
        .defaultIfEmpty(Collections.emptyList())
        .flatMapIterable(Function.identity())
        .map(p -> {
          String[] splited = p.split("::");
          if (splited.length != 2) {
            throw new IllegalArgumentException(
                "Wrong seekTo argument format. See API docs for details");
          }

          return Pair.of(Integer.parseInt(splited[0]), Long.parseLong(splited[1]));
        })
        .collectMap(Pair::getKey, Pair::getValue)
        .map(positions -> new ConsumerPosition(seekType != null ? seekType : SeekType.BEGINNING,
            positions));
  }

}
