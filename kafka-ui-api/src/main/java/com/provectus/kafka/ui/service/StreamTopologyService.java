package com.provectus.kafka.ui.service;

import static com.provectus.kafka.ui.config.ClustersProperties.StreamApplication;

import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.exception.StreamTopologyParsingException;
import com.provectus.kafka.ui.model.ProcessorTopology;
import com.provectus.kafka.ui.model.StreamApplications;
import com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Log4j2
@Service
public class StreamTopologyService {
  private final Map<String, Map<String, String>> clusterStreamApps;
  private final WebClient webClient;
  private final StreamTopologyParser topologyParser;

  public StreamTopologyService(ClustersProperties clustersProperties, WebClient webClient,
                               StreamTopologyParser topologyParser) {
    this.clusterStreamApps = getClusterToStreamAppsMap(clustersProperties);
    this.webClient = webClient;
    this.topologyParser = topologyParser;
  }

  public StreamApplications getTopologyApplications(String clusterName) {
    final var streamApplications = new StreamApplications();
    final var applicationIds = Optional.ofNullable(clusterStreamApps.get(clusterName))
        .map(Map::values)
        .map(ArrayList::new)
        .orElseThrow(ClusterNotFoundException::new);
    return streamApplications.applicationIds(applicationIds);
  }

  public Mono<ProcessorTopology> getStreamTopology(String clusterName, String applicationId) {
    return Optional.ofNullable(clusterStreamApps.get(clusterName))
        .map(apps -> apps.get(applicationId))
        .map(this::getTopologyString)
        .map(topologyMono ->
            topologyMono.map(s -> parseTopologyString(s, clusterName, applicationId))
        )
        .orElseThrow(() -> new NotFoundException("Stream application not found"));
  }

  private ProcessorTopology parseTopologyString(String topologyString, String clusterName,
                                                String applicationId) {
    try {
      return topologyParser.parse(topologyString);
    } catch (InvalidStreamTopologyString e) {
      throw new StreamTopologyParsingException(String
          .format("cannot parse stream topology <clusterName %s>, <applicationId %s",
              clusterName, applicationId));
    }
  }

  private Mono<String> getTopologyString(String topologyUrl) {
    return webClient.get()
        .uri(topologyUrl)
        .retrieve()
        .bodyToMono(String.class)
        .doOnError(log::error);
  }

  private Map<String, Map<String, String>> getClusterToStreamAppsMap(
      ClustersProperties clustersProperties) {
    return clustersProperties.getClusters().stream()
        .map(cluster -> ImmutablePair.of(cluster.getName(), getAppToEndpointMap(cluster)))
        .collect(Collectors.toMap(ImmutablePair::getKey, ImmutablePair::getValue));
  }

  private Map<String, String> getAppToEndpointMap(ClustersProperties.Cluster cluster) {
    return cluster.getStreamApplications().stream()
        .collect(Collectors.toMap(
            StreamApplication::getApplicationId,
            StreamApplication::getTopologyUrl)
        );
  }
}
