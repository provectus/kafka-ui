package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.InvalidRequestApiException;
import com.provectus.kafka.ui.exception.LogDirNotFoundApiException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.TopicOrPartitionNotFoundException;
import com.provectus.kafka.ui.mapper.DescribeLogDirsMapper;
import com.provectus.kafka.ui.model.BrokerLogdirUpdateDTO;
import com.provectus.kafka.ui.model.BrokersLogdirsDTO;
import com.provectus.kafka.ui.model.InternalBroker;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.PartitionDistributionStats;
import com.provectus.kafka.ui.service.metrics.RawMetric;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionReplica;
import org.apache.kafka.common.errors.InvalidRequestException;
import org.apache.kafka.common.errors.LogDirNotFoundException;
import org.apache.kafka.common.errors.TimeoutException;
import org.apache.kafka.common.errors.UnknownTopicOrPartitionException;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrokerService {

  private final StatisticsCache statisticsCache;
  private final AdminClientService adminClientService;
  private final DescribeLogDirsMapper describeLogDirsMapper;

  private Mono<Map<Integer, List<ConfigEntry>>> loadBrokersConfig(
      KafkaCluster cluster, List<Integer> brokersIds) {
    return adminClientService.get(cluster).flatMap(ac -> ac.loadBrokersConfig(brokersIds));
  }

  private Mono<List<ConfigEntry>> loadBrokersConfig(
      KafkaCluster cluster, Integer brokerId) {
    return loadBrokersConfig(cluster, Collections.singletonList(brokerId))
        .map(map -> map.values().stream().findFirst().orElse(List.of()));
  }

  private Flux<InternalBrokerConfig> getBrokersConfig(KafkaCluster cluster, Integer brokerId) {
    if (statisticsCache.get(cluster).getClusterDescription().getNodes()
        .stream().noneMatch(node -> node.id() == brokerId)) {
      return Flux.error(
          new NotFoundException(String.format("Broker with id %s not found", brokerId)));
    }
    return loadBrokersConfig(cluster, brokerId)
        .map(list -> list.stream()
            .map(InternalBrokerConfig::from)
            .collect(Collectors.toList()))
        .flatMapMany(Flux::fromIterable);
  }

  public Flux<InternalBroker> getBrokers(KafkaCluster cluster) {
    var stats = statisticsCache.get(cluster);
    var partitionsDistribution = PartitionDistributionStats.create(stats);
    return adminClientService
        .get(cluster)
        .flatMap(ReactiveAdminClient::describeCluster)
        .map(description -> description.getNodes().stream()
            .map(node -> new InternalBroker(node, partitionsDistribution, stats))
            .collect(Collectors.toList()))
        .flatMapMany(Flux::fromIterable);
  }

  public Mono<Void> updateBrokerLogDir(KafkaCluster cluster,
                                       Integer broker,
                                       BrokerLogdirUpdateDTO brokerLogDir) {
    return adminClientService.get(cluster)
        .flatMap(ac -> updateBrokerLogDir(ac, brokerLogDir, broker));
  }

  private Mono<Void> updateBrokerLogDir(ReactiveAdminClient admin,
                                        BrokerLogdirUpdateDTO b,
                                        Integer broker) {

    Map<TopicPartitionReplica, String> req = Map.of(
        new TopicPartitionReplica(b.getTopic(), b.getPartition(), broker),
        b.getLogDir());
    return admin.alterReplicaLogDirs(req)
        .onErrorResume(UnknownTopicOrPartitionException.class,
            e -> Mono.error(new TopicOrPartitionNotFoundException()))
        .onErrorResume(LogDirNotFoundException.class,
            e -> Mono.error(new LogDirNotFoundApiException()))
        .doOnError(e -> log.error("Unexpected error", e));
  }

  public Mono<Void> updateBrokerConfigByName(KafkaCluster cluster,
                                             Integer broker,
                                             String name,
                                             String value) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.updateBrokerConfigByName(broker, name, value))
        .onErrorResume(InvalidRequestException.class,
            e -> Mono.error(new InvalidRequestApiException(e.getMessage())))
        .doOnError(e -> log.error("Unexpected error", e));
  }

  private Mono<Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>>> getClusterLogDirs(
      KafkaCluster cluster, List<Integer> reqBrokers) {
    return adminClientService.get(cluster)
        .flatMap(admin -> {
          List<Integer> brokers = statisticsCache.get(cluster).getClusterDescription().getNodes()
              .stream()
              .map(Node::id)
              .collect(Collectors.toList());
          if (!reqBrokers.isEmpty()) {
            brokers.retainAll(reqBrokers);
          }
          return admin.describeLogDirs(brokers);
        })
        .onErrorResume(TimeoutException.class, (TimeoutException e) -> {
          log.error("Error during fetching log dirs", e);
          return Mono.just(new HashMap<>());
        });
  }

  public Flux<BrokersLogdirsDTO> getAllBrokersLogdirs(KafkaCluster cluster, List<Integer> brokers) {
    return getClusterLogDirs(cluster, brokers)
        .map(describeLogDirsMapper::toBrokerLogDirsList)
        .flatMapMany(Flux::fromIterable);
  }

  public Flux<InternalBrokerConfig> getBrokerConfig(KafkaCluster cluster, Integer brokerId) {
    return getBrokersConfig(cluster, brokerId);
  }

  public Mono<List<RawMetric>> getBrokerMetrics(KafkaCluster cluster, Integer brokerId) {
    return Mono.justOrEmpty(statisticsCache.get(cluster).getMetrics().getPerBrokerMetrics().get(brokerId));
  }

}
