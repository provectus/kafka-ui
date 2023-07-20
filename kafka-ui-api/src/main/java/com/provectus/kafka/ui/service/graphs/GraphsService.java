package com.provectus.kafka.ui.service.graphs;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.GraphDescriptionDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.text.StrSubstitutor;
import org.springframework.stereotype.Component;
import prometheus.query.api.PrometheusClientApi;
import prometheus.query.model.QueryResponse;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class GraphsService {

  private static final int TARGET_MATRIX_DATA_POINTS = 200;

  private final GraphsStorage graphsStorage;

  public Mono<QueryResponse> getGraphData(KafkaCluster cluster,
                                          String id,
                                          @Nullable Instant from,
                                          @Nullable Instant to,
                                          @Nullable Map<String, String> params) {

    var graph = graphsStorage.getDescription(id)
        .orElseThrow(() -> new NotFoundException("No graph found with id = " + id));

    var promClient = cluster.getPrometheusStorageClient();
    if (promClient == null) {
      throw new ValidationException("Prometheus not configured for cluster");
    }
    return cluster.getPrometheusStorageClient()
        .mono(client -> {
          String preparedQuery = prepareQuery(cluster.getName(), graph.getPrometheusQuery(), params);
          if (graph.getDefaultPeriod() != null) {
            return queryRange(client, preparedQuery, Duration.parse(graph.getDefaultPeriod()), from, to);
          }
          return queryInstant(client, preparedQuery);
        });
  }

  private Mono<QueryResponse> queryRange(PrometheusClientApi c,
                                         String preparedQuery,
                                         Duration defaultPeriod,
                                         @Nullable Instant from,
                                         @Nullable Instant to) {
    if (from == null) {
      from = Instant.now().minus(defaultPeriod);
    }
    if (to == null) {
      to = Instant.now();
    }
    Preconditions.checkArgument(to.isAfter(from));
    return c.queryRange(
        preparedQuery,
        String.valueOf(from.getEpochSecond()),
        String.valueOf(to.getEpochSecond()),
        calculateStepSize(from, to),
        null
    );
  }

  private String calculateStepSize(Instant from, Instant to) {
    long intervalInSecs = to.getEpochSecond() - from.getEpochSecond();
    if (intervalInSecs <= TARGET_MATRIX_DATA_POINTS) {
      return intervalInSecs + "s";
    }
    int step = ((int) (((double) intervalInSecs) / 200));
    System.out.println("Chosen step size"); //TODo
    return step + "s";
  }

  private Mono<QueryResponse> queryInstant(PrometheusClientApi c, String preparedQuery) {
    return c.query(preparedQuery, null, null);
  }


  private String prepareQuery(String clusterName, String queryTemplate, @Nullable Map<String, String> params) {
    Map<String, String> replacements = new HashMap<>();
    replacements.putAll(Optional.ofNullable(params).orElse(Map.of()));
    replacements.put("cluster", clusterName);
    return new StrSubstitutor(replacements).replace(queryTemplate);
  }

  public Stream<GraphDescriptionDTO> getAllGraphs() {
    return graphsStorage.getAll();
  }

}
