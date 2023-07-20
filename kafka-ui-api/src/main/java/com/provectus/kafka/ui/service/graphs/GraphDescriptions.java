package com.provectus.kafka.ui.service.graphs;

import com.provectus.kafka.ui.exception.ValidationException;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

@Component
class GraphDescriptions {

  private static final Duration DEFAULT_RANGE_DURATION = Duration.ofDays(7);

  private final Map<String, GraphDescription> graphsById;

  GraphDescriptions() {
    validateGraphDescr(PREDEFINED_GRAPHS);
    this.graphsById = PREDEFINED_GRAPHS.stream()
        .collect(Collectors.toMap(GraphDescription::id, d -> d));
  }

  Optional<GraphDescription> getById(String id) {
    return Optional.ofNullable(graphsById.get(id));
  }

  Stream<GraphDescription> all() {
    return graphsById.values().stream();
  }

  private void validateGraphDescr(List<GraphDescription> descriptions) {
    Map<String, String> errors = new HashMap<>();
    for (GraphDescription description : descriptions) {
      new PromQueryTemplate(description)
          .validateSyntax()
          .ifPresent(err -> errors.put(description.id(), err));
    }
    if (!errors.isEmpty()) {
      throw new ValidationException("Error validating queries for following graphs: " + errors);
    }
  }

  private static final List<GraphDescription> PREDEFINED_GRAPHS = List.of(

      GraphDescription.builder()
          .id("broker_bytes_disk_ts")
          .defaultInterval(DEFAULT_RANGE_DURATION)
          .prometheusQuery("broker_bytes_disk{cluster=\"${cluster}\"}")
          .params(Set.of())
          .build(),

      GraphDescription.builder()
          .id("broker_bytes_disk")
          .prometheusQuery("broker_bytes_disk{cluster=\"${cluster}\"}")
          .params(Set.of())
          .build(),

      GraphDescription.builder()
          .id("kafka_topic_partition_current_offset")
          .prometheusQuery("kafka_topic_partition_current_offset{cluster=\"${cluster}\"}")
          .params(Set.of())
          .build(),

      GraphDescription.builder()
          .id("kafka_topic_partition_current_offset_per_topic_ts")
          .defaultInterval(DEFAULT_RANGE_DURATION)
          .prometheusQuery("kafka_topic_partition_current_offset{cluster=\"${cluster}\",topic = \"${topic}\"}")
          .params(Set.of("topic"))
          .build()
  );

}
