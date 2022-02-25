package com.provectus.kafka.ui.config;

import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.ReadOnlyModeException;
import com.provectus.kafka.ui.service.ClustersStorage;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Order
@Component
@RequiredArgsConstructor
public class ReadOnlyModeFilter implements WebFilter {
  private static final Pattern CLUSTER_NAME_REGEX =
      Pattern.compile("/api/clusters/(?<clusterName>[^/]++)");

  private final ClustersStorage clustersStorage;

  @NotNull
  @Override
  public Mono<Void> filter(ServerWebExchange exchange, @NotNull WebFilterChain chain) {
    var isSafeMethod = exchange.getRequest().getMethod() == HttpMethod.GET;
    if (isSafeMethod) {
      return chain.filter(exchange);
    }

    var path = exchange.getRequest().getPath().pathWithinApplication().value();
    var decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);
    var matcher = CLUSTER_NAME_REGEX.matcher(decodedPath);
    if (!matcher.find()) {
      return chain.filter(exchange);
    }
    var clusterName = matcher.group("clusterName");
    var kafkaCluster = clustersStorage.getClusterByName(clusterName)
        .orElseThrow(
            () -> new ClusterNotFoundException(
                String.format("No cluster for name '%s'", clusterName)));

    if (!kafkaCluster.isReadOnly()) {
      return chain.filter(exchange);
    }

    return Mono.error(ReadOnlyModeException::new);
  }
}
