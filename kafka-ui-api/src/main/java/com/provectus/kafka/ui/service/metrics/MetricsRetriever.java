package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.model.KafkaCluster;
import org.apache.kafka.common.Node;
import reactor.core.publisher.Flux;

interface MetricsRetriever {
  Flux<RawMetric> retrieve(KafkaCluster c, Node node);
}
