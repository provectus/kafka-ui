package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.KsqlApi;
import com.provectus.kafka.ui.model.KsqlCommandV2DTO;
import com.provectus.kafka.ui.model.KsqlCommandV2ResponseDTO;
import com.provectus.kafka.ui.model.KsqlResponseDTO;
import com.provectus.kafka.ui.model.KsqlStreamDescriptionDTO;
import com.provectus.kafka.ui.model.KsqlTableDescriptionDTO;
import com.provectus.kafka.ui.model.KsqlTableResponseDTO;
import com.provectus.kafka.ui.service.ksql.KsqlServiceV2;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@RestController
@RequiredArgsConstructor
@Slf4j
public class KsqlController extends AbstractController implements KsqlApi {

  private final KsqlServiceV2 ksqlServiceV2;

  @Override
  public Mono<ResponseEntity<KsqlCommandV2ResponseDTO>> executeKsql(String clusterName,
                                                                    Mono<KsqlCommandV2DTO>
                                                                        ksqlCommand2Dto,
                                                                    ServerWebExchange exchange) {
    return ksqlCommand2Dto.map(dto -> {
      var id = ksqlServiceV2.registerCommand(
          getCluster(clusterName),
          dto.getKsql(),
          Optional.ofNullable(dto.getStreamsProperties()).orElse(Map.of()));
      return new KsqlCommandV2ResponseDTO().pipeId(id);
    }).map(ResponseEntity::ok);
  }

  @Override
  public Mono<ResponseEntity<Flux<KsqlResponseDTO>>> openKsqlResponsePipe(String clusterName,
                                                                          String pipeId,
                                                                          ServerWebExchange exchange) {
    return Mono.just(
        ResponseEntity.ok(ksqlServiceV2.execute(pipeId)
            .map(table -> new KsqlResponseDTO()
                .table(
                    new KsqlTableResponseDTO()
                        .header(table.getHeader())
                        .columnNames(table.getColumnNames())
                        .values((List<List<Object>>) ((List<?>) (table.getValues())))))));
  }

  @Override
  public Mono<ResponseEntity<Flux<KsqlStreamDescriptionDTO>>> listStreams(String clusterName,
                                                                         ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(ksqlServiceV2.listStreams(getCluster(clusterName))));
  }

  @Override
  public Mono<ResponseEntity<Flux<KsqlTableDescriptionDTO>>> listTables(String clusterName,
                                                                        ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(ksqlServiceV2.listTables(getCluster(clusterName))));
  }
}
