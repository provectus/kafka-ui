package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.KsqlApi;
import com.provectus.kafka.ui.model.KsqlCommand;

import com.provectus.kafka.ui.model.KsqlResponseTable;
import com.provectus.kafka.ui.service.KsqlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class KsqlController implements KsqlApi {
  private final KsqlService ksqlService;

  @Override
  public Mono<ResponseEntity<KsqlResponseTable>> executeKsqlCommand(String clusterName,
                                                                    Mono<KsqlCommand> ksqlCommand,
                                                                    ServerWebExchange exchange) {
    return ksqlService.executeKsqlCommand(clusterName, ksqlCommand).map(ResponseEntity::ok);
  }
}
