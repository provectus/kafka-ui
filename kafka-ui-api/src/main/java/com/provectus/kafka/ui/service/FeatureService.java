package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.Feature;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.util.List;

public interface FeatureService {
  /**
   * Get available features.
   *
   * @param cluster - cluster
   * @return List of Feature
   */
  List<Feature> getAvailableFeatures(KafkaCluster cluster);
}
