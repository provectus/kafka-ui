package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.StreamTopologiesApi;
import com.provectus.kafka.ui.model.ProcessorTopology;
import com.provectus.kafka.ui.model.StreamApplications;
import com.provectus.kafka.ui.service.StreamTopologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class StreamTopologyController implements StreamTopologiesApi {
  private final StreamTopologyService topologyService;

  @Override
  public Mono<ResponseEntity<StreamApplications>> getStreamApplications(
      String clusterName, ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(topologyService.getTopologyApplications(clusterName)));
  }

  @Override
  public Mono<ResponseEntity<ProcessorTopology>> getStreamTopology(String clusterName,
                                                                   String applicationId,
                                                                   ServerWebExchange exchange) {
    return topologyService.getStreamTopology(clusterName, applicationId)
        .map(ResponseEntity::ok);
  }
}
