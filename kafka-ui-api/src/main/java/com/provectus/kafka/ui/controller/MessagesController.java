package com.provectus.kafka.ui.controller;

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
import com.provectus.kafka.ui.model.SmartFilterTestExecutionDTO;
import com.provectus.kafka.ui.model.SmartFilterTestExecutionResultDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicSerdeSuggestionDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.AuditAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import com.provectus.kafka.ui.service.DeserializationService;
import com.provectus.kafka.ui.service.MessagesService;
import com.provectus.kafka.ui.util.DynamicConfigOperations;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Nullable;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.kafka.common.TopicPartition;
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
  private final DynamicConfigOperations dynamicConfigOperations;

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
    var contextBuilder = AccessContext.builder()
        .cluster(clusterName)
        .topic(topicName)
        .topicActions(MESSAGES_READ)
        .operationName("getTopicMessages");

    if (StringUtils.isNoneEmpty(q) && MessageFilterTypeDTO.GROOVY_SCRIPT == filterQueryType) {
      dynamicConfigOperations.checkIfFilteringGroovyEnabled();
    }

    if (auditService.isAuditTopic(getCluster(clusterName), topicName)) {
      contextBuilder.auditActions(AuditAction.VIEW);
    }

    seekType = seekType != null ? seekType : SeekTypeDTO.BEGINNING;
    seekDirection = seekDirection != null ? seekDirection : SeekDirectionDTO.FORWARD;
    filterQueryType = filterQueryType != null ? filterQueryType : MessageFilterTypeDTO.STRING_CONTAINS;

    var positions = new ConsumerPosition(
        seekType,
        topicName,
        parseSeekTo(topicName, seekType, seekTo)
    );
    Mono<ResponseEntity<Flux<TopicMessageEventDTO>>> job = Mono.just(
        ResponseEntity.ok(
            messagesService.loadMessages(
                getCluster(clusterName), topicName, positions, q, filterQueryType,
                limit, seekDirection, keySerde, valueSerde)
        )
    );

    var context = contextBuilder.build();
    return validateAccess(context)
        .then(job)
        .doOnEach(sig -> audit(context, sig));
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




}
