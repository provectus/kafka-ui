package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.MESSAGES_DELETE;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.MESSAGES_PRODUCE;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.MESSAGES_READ;
import static com.provectus.kafka.ui.serde.api.Serde.Target.KEY;
import static com.provectus.kafka.ui.serde.api.Serde.Target.VALUE;

import com.provectus.kafka.ui.api.MessagesApi;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.MessageFilterIdDTO;
import com.provectus.kafka.ui.model.MessageFilterRegistrationDTO;
import com.provectus.kafka.ui.model.MessageFilterTypeDTO;
import com.provectus.kafka.ui.model.PollingModeDTO;
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
import java.util.Optional;
import javax.annotation.Nullable;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

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

  @Deprecated
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
    throw new IllegalStateException();
  }

  @Override
  public Mono<ResponseEntity<Void>> sendTopicMessages(
      String clusterName, String topicName, @Valid Mono<CreateTopicMessageDTO> createTopicMessage,
      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_PRODUCE)
        .build());

    return validateAccess.then(
        createTopicMessage.flatMap(msg ->
            messagesService.sendMessage(getCluster(clusterName), topicName, msg).then()
        ).map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<TopicSerdeSuggestionDTO>> getSerdes(String clusterName,
                                                                 String topicName,
                                                                 SerdeUsageDTO use,
                                                                 ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(TopicAction.VIEW)
        .build());

    TopicSerdeSuggestionDTO dto = new TopicSerdeSuggestionDTO()
        .key(use == SerdeUsageDTO.SERIALIZE
            ? deserializationService.getSerdesForSerialize(getCluster(clusterName), topicName, KEY)
            : deserializationService.getSerdesForDeserialize(getCluster(clusterName), topicName, KEY))
        .value(use == SerdeUsageDTO.SERIALIZE
            ? deserializationService.getSerdesForSerialize(getCluster(clusterName), topicName, VALUE)
            : deserializationService.getSerdesForDeserialize(getCluster(clusterName), topicName, VALUE));

    return validateAccess.then(
        Mono.just(dto)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok)
    );
  }


  @Override
  public Mono<ResponseEntity<Flux<TopicMessageEventDTO>>> getTopicMessagesV2(String clusterName, String topicName,
                                                                             PollingModeDTO mode,
                                                                             @Nullable List<Integer> partitions,
                                                                             @Nullable Integer limit,
                                                                             @Nullable String query,
                                                                             @Nullable String filterId,
                                                                             @Nullable String offsetString,
                                                                             @Nullable Long ts,
                                                                             @Nullable String keySerde,
                                                                             @Nullable String valueSerde,
                                                                             ServerWebExchange exchange) {
    final Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_READ)
        .build());

    ConsumerPosition consumerPosition = ConsumerPosition.create(mode, topicName, partitions, ts, offsetString);

    int recordsLimit =
        Optional.ofNullable(limit).map(s -> Math.min(s, MAX_LOAD_RECORD_LIMIT)).orElse(DEFAULT_LOAD_RECORD_LIMIT);

    return validateAccess.then(
        Mono.just(
            ResponseEntity.ok(
                messagesService.loadMessagesV2(
                    getCluster(clusterName), topicName, consumerPosition,
                    query, filterId, recordsLimit, keySerde, valueSerde))));
  }


  @Override
  public Mono<ResponseEntity<MessageFilterIdDTO>> registerFilter(String clusterName,
                                                                 String topicName,
                                                                 Mono<MessageFilterRegistrationDTO> registration,
                                                                 ServerWebExchange exchange) {

    final Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_READ)
        .build());

    return validateAccess.then(registration)
        .map(reg -> messagesService.registerMessageFilter(reg.getFilterCode()))
        .map(id -> ResponseEntity.ok(new MessageFilterIdDTO().id(id)));
  }
}
