package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.common.Node;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class BrokerServiceImpl implements BrokerService {

  private final AdminClientService adminClientService;

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

  @Override
  public Mono<Map<String, InternalBrokerConfig>> getBrokerConfigMap(KafkaCluster cluster,
                                                                    Integer brokerId) {
    return loadBrokersConfig(cluster, brokerId)
        .map(list -> list.stream()
            .collect(Collectors.toMap(
                ConfigEntry::name,
                ClusterUtil::mapToInternalBrokerConfig)));
  }

  @Override
  public Flux<InternalBrokerConfig> getBrokersConfig(KafkaCluster cluster, Integer brokerId) {
    if (!cluster.getBrokers().contains(brokerId)) {
      return Flux.error(
          new NotFoundException(String.format("Broker with id %s not found", brokerId)));
    }
    return loadBrokersConfig(cluster, brokerId)
        .map(list -> list.stream()
            .map(ClusterUtil::mapToInternalBrokerConfig)
            .collect(Collectors.toList()))
        .flatMapMany(Flux::fromIterable);
  }

  @Override
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

  @Override
  public Mono<Node> getController(KafkaCluster cluster) {
    return adminClientService
        .get(cluster)
        .flatMap(ReactiveAdminClient::describeCluster)
        .map(ReactiveAdminClient.ClusterDescription::getController);
  }
}
