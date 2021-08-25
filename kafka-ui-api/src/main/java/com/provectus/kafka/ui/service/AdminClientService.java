package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.ExtendedAdminClient;
import com.provectus.kafka.ui.model.KafkaCluster;
import reactor.core.publisher.Mono;

public interface AdminClientService {
  /**
   * Get ExtendedAdminClient from cache if exists or create new if not.
   *
   * @param cluster - cluster
   * @return The Mono of ExtendedAdminClient
   */
  Mono<ExtendedAdminClient> getOrCreateAdminClient(KafkaCluster cluster);

  /**
   * Create new ExtendedAdminClient.
   *
   * @param cluster - cluster
   * @return The Mono of ExtendedAdminClient
   */
  Mono<ExtendedAdminClient> createAdminClient(KafkaCluster cluster);
}
