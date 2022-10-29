package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ClusterAction.VIEW;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.MESSAGES_DELETE;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.MESSAGES_PRODUCE;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.MESSAGES_READ;
import static com.provectus.kafka.ui.serde.api.Serde.Target.KEY;
import static com.provectus.kafka.ui.serde.api.Serde.Target.VALUE;
import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.api.MessagesApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.MessageFilterTypeDTO;
import com.provectus.kafka.ui.model.SeekDirectionDTO;
import com.provectus.kafka.ui.model.SeekTypeDTO;
import com.provectus.kafka.ui.model.SerdeUsageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicSerdeSuggestionDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import com.provectus.kafka.ui.service.DeserializationService;
import com.provectus.kafka.ui.service.MessagesService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.kafka.common.TopicPartition;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MessagesController extends AbstractController implements MessagesApi {

  private static final int MAX_LOAD_RECORD_LIMIT = 100;
  private static final int DEFAULT_LOAD_RECORD_LIMIT = 20;

  private final MessagesService messagesService;
  private final DeserializationService deserializationService;
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<Void>> deleteTopicMessages(
      String clusterName, String topicName, @Valid List<Integer> partitions,
      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .topic(topicName)
        .topicActions(MESSAGES_DELETE)
        .build());

    return validateAccess.then(
        messagesService.deleteTopicMessages(
            getCluster(clusterName),
            topicName,
            Optional.ofNullable(partitions).orElse(List.of())
        ).thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Flux<TopicMessageEventDTO>>> getTopicMessages(String clusterName,
                                                                           String topicName,
                                                                           SeekTypeDTO seekType,
                                                                           List<String> seekTo,
                                                                           Integer limit,
                                                                           String q,
                                                                           MessageFilterTypeDTO filterQueryType,
                                                                           SeekDirectionDTO seekDirection,
                                                                           String keySerde,
                                                                           String valueSerde,
                                                                           ServerWebExchange exchange) {
    final Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .topic(topicName)
        .topicActions(MESSAGES_READ)
        .build());

    seekType = seekType != null ? seekType : SeekTypeDTO.BEGINNING;
    seekDirection = seekDirection != null ? seekDirection : SeekDirectionDTO.FORWARD;
    filterQueryType = filterQueryType != null ? filterQueryType : MessageFilterTypeDTO.STRING_CONTAINS;
    int recordsLimit =
        Optional.ofNullable(limit).map(s -> Math.min(s, MAX_LOAD_RECORD_LIMIT)).orElse(DEFAULT_LOAD_RECORD_LIMIT);

    var positions = new ConsumerPosition(
        seekType,
        topicName,
        parseSeekTo(topicName, seekType, seekTo)
    );
    Mono<ResponseEntity<Flux<TopicMessageEventDTO>>> job = Mono.just(
        ResponseEntity.ok(
            messagesService.loadMessages(
                getCluster(clusterName), topicName, positions, q, filterQueryType,
                recordsLimit, seekDirection, keySerde, valueSerde)
        )
    );

    return validateAccess.then(job);
  }

  @Override
  public Mono<ResponseEntity<Void>> sendTopicMessages(
      String clusterName, String topicName, @Valid Mono<CreateTopicMessageDTO> createTopicMessage,
      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .topic(topicName)
        .topicActions(MESSAGES_PRODUCE)
        .build());

    return validateAccess.then(
        createTopicMessage.flatMap(msg ->
            messagesService.sendMessage(getCluster(clusterName), topicName, msg).then()
        ).map(ResponseEntity::ok)
    );
  }

  /**
   * The format is [partition]::[offset] for specifying offsets
   * or [partition]::[timestamp in millis] for specifying timestamps.
   */
  @Nullable
  private Map<TopicPartition, Long> parseSeekTo(String topic, SeekTypeDTO seekType, List<String> seekTo) {
    if (seekTo == null || seekTo.isEmpty()) {
      if (seekType == SeekTypeDTO.LATEST || seekType == SeekTypeDTO.BEGINNING) {
        return null;
      }
      throw new ValidationException("seekTo should be set if seekType is " + seekType);
    }
    return seekTo.stream()
        .map(p -> {
          String[] split = p.split("::");
          if (split.length != 2) {
            throw new IllegalArgumentException(
                "Wrong seekTo argument format. See API docs for details");
          }

          return Pair.of(
              new TopicPartition(topic, Integer.parseInt(split[0])),
              Long.parseLong(split[1])
          );
        })
        .collect(toMap(Pair::getKey, Pair::getValue));
  }

  @Override
  public Mono<ResponseEntity<TopicSerdeSuggestionDTO>> getSerdes(String clusterName,
                                                                 String topicName,
                                                                 SerdeUsageDTO use,
                                                                 ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(VIEW)
        .topic(topicName)
        .topicActions(TopicAction.VIEW)
        .build());

    return validateAccess.then(
        Mono.just(
            new TopicSerdeSuggestionDTO()
                .key(use == SerdeUsageDTO.SERIALIZE
                    ? deserializationService.getSerdesForSerialize(getCluster(clusterName), topicName, KEY)
                    : deserializationService.getSerdesForDeserialize(getCluster(clusterName), topicName, KEY))
                .value(use == SerdeUsageDTO.SERIALIZE
                    ? deserializationService.getSerdesForSerialize(getCluster(clusterName), topicName, VALUE)
                    : deserializationService.getSerdesForDeserialize(getCluster(clusterName), topicName, VALUE))
        ).map(ResponseEntity::ok)
    );
  }
}
