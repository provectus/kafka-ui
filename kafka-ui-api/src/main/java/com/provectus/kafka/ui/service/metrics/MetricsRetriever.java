package com.provectus.kafka.ui.service.metrics;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import java.util.List;
import org.apache.kafka.common.Node;

interface MetricsRetriever {
  List<MetricDTO> retrieve(KafkaCluster c, Node node);
}
