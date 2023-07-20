package com.provectus.kafka.ui.service.graphs;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import prometheus.query.api.PrometheusClientApi;
import prometheus.query.model.QueryResponse;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class GraphsService {

  private static final int TARGET_MATRIX_DATA_POINTS = 200;

  private final GraphDescriptions graphDescriptions;

  public Mono<QueryResponse> getGraphData(KafkaCluster cluster,
                                          String id,
                                          @Nullable Instant from,
                                          @Nullable Instant to,
                                          @Nullable Map<String, String> params) {

    var graph = graphDescriptions.getById(id)
        .orElseThrow(() -> new NotFoundException("No graph found with id = " + id));

    var promClient = cluster.getPrometheusStorageClient();
    if (promClient == null) {
      throw new ValidationException("Prometheus not configured for cluster");
    }
    String preparedQuery = prepareQuery(graph, cluster.getName(), params);
    return cluster.getPrometheusStorageClient()
        .mono(client -> {
          if (graph.isRange()) {
            return queryRange(client, preparedQuery, graph.defaultInterval(), from, to);
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
    int step = ((int) (((double) intervalInSecs) / TARGET_MATRIX_DATA_POINTS));
    return step + "s";
  }

  private Mono<QueryResponse> queryInstant(PrometheusClientApi c, String preparedQuery) {
    return c.query(preparedQuery, null, null);
  }

  private String prepareQuery(GraphDescription d, String clusterName, @Nullable Map<String, String> params) {
    return new PromQueryTemplate(d).getQuery(clusterName, Optional.ofNullable(params).orElse(Map.of()));
  }

  public Stream<GraphDescription> getGraphs(KafkaCluster cluster) {
    if (cluster.getPrometheusStorageClient() == null) {
      return Stream.empty();
    }
    return graphDescriptions.all();
  }

}
