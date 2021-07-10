package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.StreamTopologyApi;
import com.provectus.kafka.ui.model.ProcessorTopology;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
public class StreamTopologyController implements StreamTopologyApi {

  @Override
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  public Mono<ResponseEntity<ProcessorTopology>> getStreamTopology(String clusterName,
                                                                   Integer applicationId,
                                                                   ServerWebExchange exchange) {
    return Mono.empty();
  }
}
