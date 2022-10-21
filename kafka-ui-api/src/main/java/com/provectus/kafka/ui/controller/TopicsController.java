package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.ANALYSIS_RUN;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.ANALYSIS_VIEW;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.CREATE;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.DELETE;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.EDIT;
import static com.provectus.kafka.ui.model.rbac.permission.TopicAction.VIEW;
import static java.util.stream.Collectors.toList;

import com.provectus.kafka.ui.api.TopicsApi;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.InternalTopicConfig;
import com.provectus.kafka.ui.model.PartitionsIncreaseDTO;
import com.provectus.kafka.ui.model.PartitionsIncreaseResponseDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeDTO;
import com.provectus.kafka.ui.model.ReplicationFactorChangeResponseDTO;
import com.provectus.kafka.ui.model.SortOrderDTO;
import com.provectus.kafka.ui.model.TopicAnalysisDTO;
import com.provectus.kafka.ui.model.TopicColumnsToSortDTO;
import com.provectus.kafka.ui.model.TopicConfigDTO;
import com.provectus.kafka.ui.model.TopicCreationDTO;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.TopicDetailsDTO;
import com.provectus.kafka.ui.model.TopicUpdateDTO;
import com.provectus.kafka.ui.model.TopicsResponseDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.ClusterAction;
import com.provectus.kafka.ui.service.TopicsService;
import com.provectus.kafka.ui.service.analyze.TopicAnalysisService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class TopicsController extends AbstractController implements TopicsApi {

  private static final Integer DEFAULT_PAGE_SIZE = 25;

  private final TopicsService topicsService;
  private final TopicAnalysisService topicAnalysisService;
  private final ClusterMapper clusterMapper;
  private final AccessControlService accessControlService;

  @Override
  public Mono<ResponseEntity<TopicDTO>> createTopic(
      String clusterName, @Valid Mono<TopicCreationDTO> topicCreation, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topicActions(CREATE)
        .build());

    return validateAccess.then(
        topicsService.createTopic(getCluster(clusterName), topicCreation)
            .map(clusterMapper::toTopic)
            .map(s -> new ResponseEntity<>(s, HttpStatus.OK))
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
    );
  }

  @Override
  public Mono<ResponseEntity<TopicDTO>> recreateTopic(String clusterName,
                                                      String topicName, ServerWebExchange serverWebExchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW, CREATE, DELETE)
        .build());

    return validateAccess.then(
        topicsService.recreateTopic(getCluster(clusterName), topicName)
            .map(clusterMapper::toTopic)
            .map(s -> new ResponseEntity<>(s, HttpStatus.CREATED))
    );
  }

  @Override
  public Mono<ResponseEntity<TopicDTO>> cloneTopic(
      String clusterName, String topicName, String newTopicName, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW, CREATE)
        .build());

    return validateAccess.then(topicsService.cloneTopic(getCluster(clusterName), topicName, newTopicName)
        .map(clusterMapper::toTopic)
        .map(s -> new ResponseEntity<>(s, HttpStatus.CREATED))
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> deleteTopic(
      String clusterName, String topicName, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(DELETE)
        .build());

    return validateAccess.then(
        topicsService.deleteTopic(getCluster(clusterName), topicName).map(ResponseEntity::ok)
    );
  }


  @Override
  public Mono<ResponseEntity<Flux<TopicConfigDTO>>> getTopicConfigs(
      String clusterName, String topicName, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW)
        .build());

    return validateAccess.then(
        topicsService.getTopicConfigs(getCluster(clusterName), topicName)
            .map(lst -> lst.stream()
                .map(InternalTopicConfig::from)
                .map(clusterMapper::toTopicConfig)
                .collect(toList()))
            .map(Flux::fromIterable)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<TopicDetailsDTO>> getTopicDetails(
      String clusterName, String topicName, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW)
        .build());

    return validateAccess.then(
        topicsService.getTopicDetails(getCluster(clusterName), topicName)
            .map(clusterMapper::toTopicDetails)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<TopicsResponseDTO>> getTopics(String clusterName,
                                                           @Valid Integer page,
                                                           @Valid Integer perPage,
                                                           @Valid Boolean showInternal,
                                                           @Valid String search,
                                                           @Valid TopicColumnsToSortDTO orderBy,
                                                           @Valid SortOrderDTO sortOrder,
                                                           ServerWebExchange exchange) {

    return topicsService.getTopicsForPagination(getCluster(clusterName))
        .flatMap(existingTopics -> {
          int pageSize = perPage != null && perPage > 0 ? perPage : DEFAULT_PAGE_SIZE;
          var topicsToSkip = ((page != null && page > 0 ? page : 1) - 1) * pageSize;
          var comparator = sortOrder == null || !sortOrder.equals(SortOrderDTO.DESC)
              ? getComparatorForTopic(orderBy) : getComparatorForTopic(orderBy).reversed();
          List<InternalTopic> filtered = existingTopics.stream()
              .filter(topic -> !topic.isInternal()
                  || showInternal != null && showInternal)
              .filter(topic -> search == null || StringUtils.contains(topic.getName(), search))
              .sorted(comparator)
              .collect(toList());
          var totalPages = (filtered.size() / pageSize)
              + (filtered.size() % pageSize == 0 ? 0 : 1);

          List<String> topicsPage = filtered.stream()
              .skip(topicsToSkip)
              .limit(pageSize)
              .map(InternalTopic::getName)
              .collect(toList());

          return topicsService.loadTopics(getCluster(clusterName), topicsPage)
              .flatMapMany(Flux::fromIterable)
              .filterWhen(dto -> accessControlService.isTopicAccessible(dto, clusterName))
              .collectList()
              .map(topicsToRender ->
                  new TopicsResponseDTO()
                      .topics(topicsToRender.stream().map(clusterMapper::toTopic).collect(toList()))
                      .pageCount(totalPages));
        })
        .map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<TopicDTO>> updateTopic(
      String clusterName, String topicName, @Valid Mono<TopicUpdateDTO> topicUpdate,
      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW, EDIT)
        .build());

    return validateAccess.then(
        topicsService
            .updateTopic(getCluster(clusterName), topicName, topicUpdate)
            .map(clusterMapper::toTopic)
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<PartitionsIncreaseResponseDTO>> increaseTopicPartitions(
      String clusterName, String topicName,
      Mono<PartitionsIncreaseDTO> partitionsIncrease,
      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW, EDIT)
        .build());

    return validateAccess.then(
        partitionsIncrease.flatMap(partitions ->
            topicsService.increaseTopicPartitions(getCluster(clusterName), topicName, partitions)
        ).map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<ReplicationFactorChangeResponseDTO>> changeReplicationFactor(
      String clusterName, String topicName,
      Mono<ReplicationFactorChangeDTO> replicationFactorChange,
      ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(VIEW, EDIT)
        .build());

    return validateAccess.then(
        replicationFactorChange
            .flatMap(rfc ->
                topicsService.changeReplicationFactor(getCluster(clusterName), topicName, rfc))
            .map(ResponseEntity::ok)
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> analyzeTopic(String clusterName, String topicName, ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(ANALYSIS_RUN)
        .build());

    return validateAccess.then(
        topicAnalysisService.analyze(getCluster(clusterName), topicName)
            .thenReturn(ResponseEntity.ok().build())
    );
  }

  @Override
  public Mono<ResponseEntity<Void>> cancelTopicAnalysis(String clusterName, String topicName,
                                                        ServerWebExchange exchange) {
    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(ANALYSIS_RUN)
        .build());

    topicAnalysisService.cancelAnalysis(getCluster(clusterName), topicName);

    return validateAccess.then(Mono.just(ResponseEntity.ok().build()));
  }


  @Override
  public Mono<ResponseEntity<TopicAnalysisDTO>> getTopicAnalysis(String clusterName,
                                                                 String topicName,
                                                                 ServerWebExchange exchange) {

    Mono<Void> validateAccess = accessControlService.validateAccess(AccessContext.builder()
        .cluster(clusterName)
        .clusterActions(ClusterAction.VIEW)
        .topic(topicName)
        .topicActions(ANALYSIS_VIEW)
        .build());

    return validateAccess.then(Mono.just(
        topicAnalysisService.getTopicAnalysis(getCluster(clusterName), topicName)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build()))
    );
  }

  private Comparator<InternalTopic> getComparatorForTopic(
      TopicColumnsToSortDTO orderBy) {
    var defaultComparator = Comparator.comparing(InternalTopic::getName);
    if (orderBy == null) {
      return defaultComparator;
    }
    switch (orderBy) {
      case TOTAL_PARTITIONS:
        return Comparator.comparing(InternalTopic::getPartitionCount);
      case OUT_OF_SYNC_REPLICAS:
        return Comparator.comparing(t -> t.getReplicas() - t.getInSyncReplicas());
      case REPLICATION_FACTOR:
        return Comparator.comparing(InternalTopic::getReplicationFactor);
      case SIZE:
        return Comparator.comparing(InternalTopic::getSegmentSize);
      case NAME:
      default:
        return defaultComparator;
    }
  }
}
