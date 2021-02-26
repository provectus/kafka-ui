package com.provectus.kafka.ui.rest.config;

import com.provectus.kafka.ui.cluster.exception.NotFoundException;
import com.provectus.kafka.ui.cluster.exception.ReadOnlyException;
import com.provectus.kafka.ui.cluster.model.ClustersStorage;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.regex.Pattern;

@Order
@Component
@RequiredArgsConstructor
public class ReadOnlyModeFilter implements WebFilter {
    private static final Pattern CLUSTER_NAME_REGEX = Pattern.compile("/api/clusters/(?<clusterName>[^/]++)");

    private final ClustersStorage clustersStorage;

    @NotNull
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, @NotNull WebFilterChain chain) {
        var isSafeMethod = exchange.getRequest().getMethod() == HttpMethod.GET;
        if (isSafeMethod) {
            return chain.filter(exchange);
        }

        var path = exchange.getRequest().getURI().getPath();
        var matcher = CLUSTER_NAME_REGEX.matcher(path);
        if (!matcher.find()) {
            return chain.filter(exchange);
        }
        var clusterName = matcher.group("clusterName");
        var kafkaCluster = clustersStorage.getClusterByName(clusterName)
                .orElseThrow(() -> new NotFoundException(String.format("No cluster for name '%s'", clusterName)));

        if (!kafkaCluster.getReadOnly()) {
            return chain.filter(exchange);
        }

        return Mono.error(ReadOnlyException::new);
    }
}
