package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.InvalidRequestApiException;
import com.provectus.kafka.ui.exception.LogDirNotFoundApiException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.TopicOrPartitionNotFoundException;
import com.provectus.kafka.ui.mapper.ClusterMapper;
import com.provectus.kafka.ui.mapper.DescribeLogDirsMapper;
import com.provectus.kafka.ui.model.BrokerConfigDTO;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.BrokerLogdirUpdateDTO;
import com.provectus.kafka.ui.model.BrokerMetricsDTO;
import com.provectus.kafka.ui.model.BrokersLogdirsDTO;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
@Log4j2
public class BrokerService {

  private final AdminClientService adminClientService;
  private final DescribeLogDirsMapper describeLogDirsMapper;
  private final ClusterMapper clusterMapper;

  private Mono<Map<Integer, List<ConfigEntry>>> loadBrokersConfig(
      KafkaCluster cluster, List<Integer> brokersIds) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.loadBrokersConfig(brokersIds));
  }

  private Mono<List<ConfigEntry>> loadBrokersConfig(
      KafkaCluster cluster, Integer brokerId) {
    return loadBrokersConfig(cluster, Collections.singletonList(brokerId))
        .map(map -> map.values().stream()
            .findFirst()
            .orElseThrow(() -> new IllegalEntityStateException(
                String.format("Config for broker %s not found", brokerId)))
        );
  }

  public Mono<Map<String, InternalBrokerConfig>> getBrokerConfigMap(KafkaCluster cluster,
                                                                    Integer brokerId) {
    return loadBrokersConfig(cluster, brokerId)
        .map(list -> list.stream()
            .collect(Collectors.toMap(
                ConfigEntry::name,
                ClusterUtil::mapToInternalBrokerConfig)));
  }

  private Flux<InternalBrokerConfig> getBrokersConfig(KafkaCluster cluster, Integer brokerId) {
    if (!cluster.getMetrics().getBrokers().contains(brokerId)) {
      return Flux.error(
          new NotFoundException(String.format("Broker with id %s not found", brokerId)));
    }
    return loadBrokersConfig(cluster, brokerId)
        .map(list -> list.stream()
            .map(ClusterUtil::mapToInternalBrokerConfig)
            .collect(Collectors.toList()))
        .flatMapMany(Flux::fromIterable);
  }

  public Flux<BrokerDTO> getBrokers(KafkaCluster cluster) {
    return adminClientService
        .get(cluster)
        .flatMap(ReactiveAdminClient::describeCluster)
        .map(description -> description.getNodes().stream()
            .map(node -> {
              BrokerDTO broker = new BrokerDTO();
              broker.setId(node.id());
              broker.setHost(node.host());
              return broker;
            }).collect(Collectors.toList()))
        .flatMapMany(Flux::fromIterable);
  }

  public Mono<Node> getController(KafkaCluster cluster) {
    return adminClientService
        .get(cluster)
        .flatMap(ReactiveAdminClient::describeCluster)
        .map(ReactiveAdminClient.ClusterDescription::getController);
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
    return  admin.alterReplicaLogDirs(req)
        .onErrorResume(UnknownTopicOrPartitionException.class,
            e -> Mono.error(new TopicOrPartitionNotFoundException()))
        .onErrorResume(LogDirNotFoundException.class,
            e -> Mono.error(new LogDirNotFoundApiException()))
        .doOnError(log::error);
  }

  public Mono<Void> updateBrokerConfigByName(KafkaCluster cluster,
                                             Integer broker,
                                             String name,
                                             String value) {
    return adminClientService.get(cluster)
        .flatMap(ac -> ac.updateBrokerConfigByName(broker, name, value))
        .onErrorResume(InvalidRequestException.class,
            e -> Mono.error(new InvalidRequestApiException(e.getMessage())))
        .doOnError(log::error);
  }

  private Mono<Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>>> getClusterLogDirs(
      KafkaCluster cluster, List<Integer> reqBrokers) {
    return adminClientService.get(cluster)
        .flatMap(admin -> {
          List<Integer> brokers = new ArrayList<>(cluster.getMetrics().getBrokers());
          if (reqBrokers != null && !reqBrokers.isEmpty()) {
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

  public Flux<BrokerConfigDTO> getBrokerConfig(KafkaCluster cluster, Integer brokerId) {
    return getBrokersConfig(cluster, brokerId)
        .map(clusterMapper::toBrokerConfig);
  }

  public Mono<BrokerMetricsDTO> getBrokerMetrics(KafkaCluster cluster, Integer id) {
    return Mono.just(cluster.getMetrics().getInternalBrokerMetrics())
        .map(m -> m.get(id))
        .map(clusterMapper::toBrokerMetrics);
  }

}
