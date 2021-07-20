package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.StreamTopologiesApi;
import com.provectus.kafka.ui.model.ProcessorTopology;
import com.provectus.kafka.ui.model.StreamApplications;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class StreamTopologyController implements StreamTopologiesApi {

  @Override
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  public Mono<ResponseEntity<StreamApplications>> getStreamApplications(
      String clusterName, ServerWebExchange exchange) {
    return Mono.empty();
  }

  @Override
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  public Mono<ResponseEntity<ProcessorTopology>> getStreamTopology(String clusterName,
                                                                   String applicationId,
                                                                   ServerWebExchange exchange) {
    return Mono.empty();
  }
}
