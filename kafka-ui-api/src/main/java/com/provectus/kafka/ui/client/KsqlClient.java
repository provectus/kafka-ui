package com.provectus.kafka.ui.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.model.KsqlResponseTable;
import com.provectus.kafka.ui.strategy.ksqlStatement.KsqlStatementStrategy;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public final class KsqlClient {
  private final WebClient webClient;
  private final ObjectMapper mapper;

  public Mono<KsqlResponseTable> execute(KsqlStatementStrategy ksqlStatement) {
    return webClient.post()
      .uri(ksqlStatement.getUri())
      .accept(new MediaType("application","vnd.ksql.v1+json"))
      .body(BodyInserters.fromValue(ksqlStatement.getKsqlCommand()))
      .retrieve()
      .bodyToMono(byte[].class)
      .map(this::toJson)
      .map(ksqlStatement::serializeResponse)
      .doOnError(log::error);
  }

  @SneakyThrows
  private JsonNode toJson(byte[] content) {
    return this.mapper.readTree(content);
  }
}
