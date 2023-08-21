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
import com.provectus.kafka.ui.model.SmartFilterTestExecutionDTO;
import com.provectus.kafka.ui.model.SmartFilterTestExecutionResultDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicSerdeSuggestionDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.AuditAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import com.provectus.kafka.ui.service.DeserializationService;
import com.provectus.kafka.ui.service.MessagesService;
import java.util.List;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.ValidationException;
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

  private final MessagesService messagesService;
  private final DeserializationService deserializationService;

  @Override
  public Mono<ResponseEntity<Void>> deleteTopicMessages(
      String clusterName, String topicName, @Valid List<Integer> partitions,
      ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_DELETE)
        .build();

    return validateAccess(context).<ResponseEntity<Void>>then(
        messagesService.deleteTopicMessages(
            getCluster(clusterName),
            topicName,
            Optional.ofNullable(partitions).orElse(List.of())
        ).thenReturn(ResponseEntity.ok().build())
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<SmartFilterTestExecutionResultDTO>> executeSmartFilterTest(
      Mono<SmartFilterTestExecutionDTO> smartFilterTestExecutionDto, ServerWebExchange exchange) {
    return smartFilterTestExecutionDto
        .map(MessagesService::execSmartFilterTest)
        .map(ResponseEntity::ok);
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
    throw new ValidationException("Not supported");
  }


  @Override
  public Mono<ResponseEntity<Flux<TopicMessageEventDTO>>> getTopicMessagesV2(String clusterName, String topicName,
                                                                             PollingModeDTO mode,
                                                                             List<Integer> partitions,
                                                                             Integer limit,
                                                                             String stringFilter,
                                                                             String smartFilterId,
                                                                             Long offset,
                                                                             Long timestamp,
                                                                             String keySerde,
                                                                             String valueSerde,
                                                                             String cursor,
                                                                             ServerWebExchange exchange) {
    var contextBuilder = AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_READ)
        .operationName("getTopicMessages");

    if (auditService.isAuditTopic(getCluster(clusterName), topicName)) {
      contextBuilder.auditActions(AuditAction.VIEW);
    }

    var accessContext = contextBuilder.build();

    Flux<TopicMessageEventDTO> messagesFlux;
    if (cursor != null) {
      messagesFlux = messagesService.loadMessages(getCluster(clusterName), topicName, cursor);
    } else {
      messagesFlux = messagesService.loadMessages(
          getCluster(clusterName),
          topicName,
          ConsumerPosition.create(mode, topicName, partitions, timestamp, offset),
          stringFilter,
          smartFilterId,
          limit,
          keySerde,
          valueSerde
      );
    }
    return accessControlService.validateAccess(accessContext)
        .then(Mono.just(ResponseEntity.ok(messagesFlux)))
        .doOnEach(sig -> auditService.audit(accessContext, sig));
  }

  @Override
  public Mono<ResponseEntity<Void>> sendTopicMessages(
      String clusterName, String topicName, @Valid Mono<CreateTopicMessageDTO> createTopicMessage,
      ServerWebExchange exchange) {

    var context = AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_PRODUCE)
        .operationName("sendTopicMessages")
        .build();

    return validateAccess(context).then(
        createTopicMessage.flatMap(msg ->
            messagesService.sendMessage(getCluster(clusterName), topicName, msg).then()
        ).map(ResponseEntity::ok)
    ).doOnEach(sig -> audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<TopicSerdeSuggestionDTO>> getSerdes(String clusterName,
                                                                 String topicName,
                                                                 SerdeUsageDTO use,
                                                                 ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(TopicAction.VIEW)
        .operationName("getSerdes")
        .build();

    TopicSerdeSuggestionDTO dto = new TopicSerdeSuggestionDTO()
        .key(use == SerdeUsageDTO.SERIALIZE
            ? deserializationService.getSerdesForSerialize(getCluster(clusterName), topicName, KEY)
            : deserializationService.getSerdesForDeserialize(getCluster(clusterName), topicName, KEY))
        .value(use == SerdeUsageDTO.SERIALIZE
            ? deserializationService.getSerdesForSerialize(getCluster(clusterName), topicName, VALUE)
            : deserializationService.getSerdesForDeserialize(getCluster(clusterName), topicName, VALUE));

    return validateAccess(context).then(
        Mono.just(dto)
            .subscribeOn(Schedulers.boundedElastic())
            .map(ResponseEntity::ok)
    );
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
