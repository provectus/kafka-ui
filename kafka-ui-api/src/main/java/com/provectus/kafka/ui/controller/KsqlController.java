package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.KsqlApi;
import com.provectus.kafka.ui.model.KsqlCommandDTO;
import com.provectus.kafka.ui.model.KsqlCommandResponseDTO;
import com.provectus.kafka.ui.model.KsqlResponseDTO;
import com.provectus.kafka.ui.model.KsqlTableResponseDTO;
import com.provectus.kafka.ui.service.KsqlService;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient;
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
  private final KsqlService ksqlService;

  @Override
  public Mono<ResponseEntity<KsqlCommandResponseDTO>> executeKsqlCommand(String clusterName,
                                                                         Mono<KsqlCommandDTO>
                                                                             ksqlCommand,
                                                                         ServerWebExchange exchange) {
    return ksqlService.executeKsqlCommand(getCluster(clusterName), ksqlCommand)
        .map(ResponseEntity::ok);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Mono<ResponseEntity<Flux<KsqlResponseDTO>>> executeKsql(String clusterName,
                                                                 Mono<KsqlCommandDTO> ksqlCommand,
                                                                 ServerWebExchange exchange) {
    return Mono.just(
        ResponseEntity.ok(
            ksqlCommand
                .flux()
                .flatMap(command ->
                    new KsqlApiClient(getCluster(clusterName))
                        .execute(
                            command.getKsql(),
                            Optional.ofNullable(command.getStreamsProperties()).orElse(Map.of())))
                .map(table -> new KsqlResponseDTO()
                    .table(
                        new KsqlTableResponseDTO()
                            .header(table.getHeader())
                            .columnNames(table.getColumnNames())
                            .values((List<List<Object>>) ((List<?>) (table.getValues())))))));
  }
}
