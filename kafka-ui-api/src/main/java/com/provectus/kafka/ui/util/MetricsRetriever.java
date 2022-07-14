package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricDTO;
import java.util.List;
import lombok.SneakyThrows;
import org.apache.kafka.common.Node;

public interface MetricsRetriever {
  @SneakyThrows
  List<MetricDTO> retrieve(KafkaCluster c, Node node);
}
