package com.provectus.kafka.ui.service.graphs;

import com.provectus.kafka.ui.model.GraphDescriptionDTO;
import com.provectus.kafka.ui.model.GraphParameterDTO;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

@Component
class GraphsStorage {
  
  private final Map<String, GraphDescriptionDTO> graphsById;

  GraphsStorage() {
    this.graphsById = PREDEFINED_GRAPHS.stream()
        .collect(Collectors.toMap(GraphDescriptionDTO::getId, d -> d));
  }

  Optional<GraphDescriptionDTO> getDescription(String id) {
    return Optional.ofNullable(graphsById.get(id));
  }

  Stream<GraphDescriptionDTO> getAll() {
    return graphsById.values().stream();
  }

  private static final List<GraphDescriptionDTO> PREDEFINED_GRAPHS = List.of(

      new GraphDescriptionDTO("broker_bytes_disk_ts")
          .defaultPeriod(Duration.ofDays(7).toString())
          .prometheusQuery("broker_bytes_disk{cluster=\"${cluster}\"}"),

      new GraphDescriptionDTO("broker_bytes_disk")
          .prometheusQuery("broker_bytes_disk{cluster=\"${cluster}\"}"),

      new GraphDescriptionDTO("kafka_topic_partition_current_offset")
          .prometheusQuery("topic_bytes_disk{cluster=\"${cluster}\"}"),

      new GraphDescriptionDTO("kafka_topic_partition_current_offset_ts")
          .defaultPeriod(Duration.ofDays(7).toString())
          .prometheusQuery("topic_bytes_disk{cluster=\"${cluster}\"}"),

      new GraphDescriptionDTO("kafka_topic_partition_current_offset_per_topic_ts")
          .defaultPeriod(Duration.ofDays(7).toString())
          .prometheusQuery("topic_bytes_disk{cluster=\"${cluster}\", topic = \"${topic}\"}")
          .addParametersItem(new GraphParameterDTO().name("topic"))
  );

}
