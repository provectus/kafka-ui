package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.KafkaCluster;
import reactor.core.publisher.Flux;

public interface FeatureService {
  /**
   * Get available features.
   *
   * @param cluster - cluster
   * @return List of Feature
   */
  Flux<Feature> getAvailableFeatures(KafkaCluster cluster);
}
