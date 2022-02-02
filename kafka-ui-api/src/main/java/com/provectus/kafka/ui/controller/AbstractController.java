package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ClustersStorage;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbstractController {

  private ClustersStorage clustersStorage;

  protected KafkaCluster getCluster(String name) {
    return clustersStorage.getClusterByName(name)
        .orElseThrow(() -> new ClusterNotFoundException(
            String.format("Cluster with name '%s' not found", name)));
  }

  @Autowired
  public void setClustersStorage(ClustersStorage clustersStorage) {
    this.clustersStorage = clustersStorage;
  }
}
