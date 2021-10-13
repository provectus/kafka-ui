package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.StreamTopologiesApi;
import com.provectus.kafka.ui.model.ProcessorTopologyDTO;
import com.provectus.kafka.ui.model.StreamApplicationsDTO;
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
  public Mono<ResponseEntity<StreamApplicationsDTO>> getStreamApplications(
      String clusterName, ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(topologyService.getTopologyApplications(clusterName)));
  }

  @Override
  public Mono<ResponseEntity<ProcessorTopologyDTO>> getStreamTopology(String clusterName,
                                                                   String applicationId,
                                                                   ServerWebExchange exchange) {
    return topologyService.getStreamTopology(clusterName, applicationId)
        .map(ResponseEntity::ok);
  }
}
