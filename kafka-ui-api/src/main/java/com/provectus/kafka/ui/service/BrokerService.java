package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.BrokerDTO;
import com.provectus.kafka.ui.model.InternalBrokerConfig;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.Map;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface BrokerService {
  /**
   * Get brokers config as map (Config name, Config).
   *
   * @param cluster - cluster
   * @param brokerId - node id
   * @return Mono of Map(String, InternalBrokerConfig)
   */
  Mono<Map<String, InternalBrokerConfig>> getBrokerConfigMap(KafkaCluster cluster,
                                                             Integer brokerId);

  /**
   * Get brokers config as Flux of InternalBrokerConfig.
   *
   * @param cluster - cluster
   * @param brokerId - node id
   * @return Flux of InternalBrokerConfig
   */
  Flux<InternalBrokerConfig> getBrokersConfig(KafkaCluster cluster, Integer brokerId);

  /**
   * Get active brokers in cluster.
   *
   * @param cluster - cluster
   * @return Flux of Broker
   */
  Flux<BrokerDTO> getBrokers(KafkaCluster cluster);

  /**
   * Get cluster controller node.
   *
   * @param cluster - cluster
   * @return Controller node
   */
  Mono<Node> getController(KafkaCluster cluster);
}
