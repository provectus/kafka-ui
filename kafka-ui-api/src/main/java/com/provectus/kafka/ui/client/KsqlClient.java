package com.provectus.kafka.ui.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import com.provectus.kafka.ui.strategy.ksqlStatement.KsqlStatementStrategy;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class KsqlClient {
  private final WebClient webClient;
  private final ObjectMapper mapper;

  public Mono<KsqlCommandResponse> execute(KsqlStatementStrategy ksqlStatement) {
    return webClient.post()
        .uri(ksqlStatement.getUri())
        .accept(new MediaType("application", "vnd.ksql.v1+json"))
        .body(BodyInserters.fromValue(ksqlStatement.getKsqlCommand()))
        .retrieve()
        .onStatus(HttpStatus::isError, this::getErrorMessage)
        .bodyToMono(byte[].class)
        .map(this::toJson)
        .map(ksqlStatement::serializeResponse);
  }

  private Mono<Throwable> getErrorMessage(ClientResponse response) {
    return response
        .bodyToMono(byte[].class)
        .map(this::toJson)
        .map(jsonNode -> jsonNode.get("message").asText())
        .flatMap(error -> Mono.error(new UnprocessableEntityException(error)));
  }

  @SneakyThrows
  private JsonNode toJson(byte[] content) {
    return this.mapper.readTree(content);
  }
}
