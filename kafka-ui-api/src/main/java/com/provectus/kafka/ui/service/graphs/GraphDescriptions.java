package com.provectus.kafka.ui.service.graphs;

import static java.util.stream.Collectors.toMap;

import com.provectus.kafka.ui.exception.ValidationException;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

@Component
class GraphDescriptions {

  private static final Duration DEFAULT_RANGE_DURATION = Duration.ofDays(7);

  private final Map<String, GraphDescription> graphsById;

  GraphDescriptions() {
    validate();
    this.graphsById = PREDEFINED_GRAPHS.stream().collect(toMap(GraphDescription::id, d -> d));
  }

  Optional<GraphDescription> getById(String id) {
    return Optional.ofNullable(graphsById.get(id));
  }

  Stream<GraphDescription> all() {
    return graphsById.values().stream();
  }

  private void validate() {
    Map<String, String> errors = new HashMap<>();
    for (GraphDescription description : PREDEFINED_GRAPHS) {
      new PromQueryTemplate(description)
          .validateSyntax()
          .ifPresent(err -> errors.put(description.id(), err));
    }
    if (!errors.isEmpty()) {
      throw new ValidationException("Error validating queries for following graphs: " + errors);
    }
  }

  private static final List<GraphDescription> PREDEFINED_GRAPHS = List.of(

      GraphDescription.range(DEFAULT_RANGE_DURATION)
          .id("broker_bytes_disk_ts")
          .prometheusQuery("broker_bytes_disk{cluster=\"${cluster}\"}")
          .params(Set.of())
          .build(),

      GraphDescription.instant()
          .id("broker_bytes_disk")
          .prometheusQuery("broker_bytes_disk{cluster=\"${cluster}\"}")
          .params(Set.of())
          .build(),

      GraphDescription.instant()
          .id("kafka_topic_partition_current_offset")
          .prometheusQuery("kafka_topic_partition_current_offset{cluster=\"${cluster}\"}")
          .params(Set.of())
          .build(),

      GraphDescription.range(DEFAULT_RANGE_DURATION)
          .id("kafka_topic_partition_current_offset_per_topic_ts")
          .prometheusQuery("kafka_topic_partition_current_offset{cluster=\"${cluster}\",topic = \"${topic}\"}")
          .params(Set.of("topic"))
          .build()
  );

}
