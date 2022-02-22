package com.provectus.kafka.ui.service.ksql;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ksql.response.ResponseParser;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.Builder;
import lombok.Value;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;

public class KsqlApiClient {

  @Builder
  @Value
  public static class KsqlResponseTable {
    String header;
    List<String> columnNames;
    List<List<JsonNode>> values;
  }

  @Value
  private static class KsqlRequest {
    String ksql;
    Map<String, String> streamsProperties;
  }

  //--------------------------------------------------------------------------------------------

  private final KafkaCluster cluster;

  public KsqlApiClient(KafkaCluster cluster) {
    this.cluster = cluster;
  }

  private WebClient webClient() {
    return WebClient.create();
  }

  private String baseKsqlDbUri() {
    return cluster.getKsqldbServer();
  }

  private KsqlRequest ksqlRequest(String ksql, Map<String, String> streamProperties) {
    return new KsqlRequest(ksql, streamProperties);
  }

  private Flux<KsqlResponseTable> executeSelect(String ksql, Map<String, String> streamProperties) {
    return webClient()
        .post()
        .uri(baseKsqlDbUri() + "/query")
        .accept(MediaType.parseMediaType("application/vnd.ksql.v1+json"))
        .contentType(MediaType.parseMediaType("application/json"))
        .bodyValue(ksqlRequest(ksql, streamProperties))
        .retrieve()
        .bodyToFlux(JsonNode.class)
        .map(ResponseParser::parseSelectResponse)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .onErrorResume(WebClientResponseException.class,
            e -> Flux.just(ResponseParser.parseErrorResponse(e)));
  }

  private Flux<KsqlResponseTable> executeStatement(String ksql,
                                                   Map<String, String> streamProperties) {
    return webClient()
        .post()
        .uri(baseKsqlDbUri() + "/ksql")
        .accept(MediaType.parseMediaType("application/vnd.ksql.v1+json"))
        .contentType(MediaType.parseMediaType("application/json"))
        .bodyValue(ksqlRequest(ksql, streamProperties))
        .exchangeToFlux(
            resp -> {
              if (resp.statusCode().isError()) {
                return resp.createException().flux().map(ResponseParser::parseErrorResponse);
              }
              return resp.bodyToFlux(JsonNode.class)
                  .flatMap(body ->
                      // body can be an array or single object
                      (body.isArray() ? Flux.fromIterable(body) : Flux.just(body))
                          .flatMapIterable(ResponseParser::parseStatementResponse))
                  // body can be empty for some statements like INSERT
                  .switchIfEmpty(
                      Flux.just(KsqlResponseTable.builder()
                          .header("Query Result")
                          .columnNames(List.of("Result"))
                          .values(List.of(List.of(new TextNode("Success"))))
                          .build()));
            }
        );
  }

  public Flux<KsqlResponseTable> execute(String ksql, Map<String, String> streamProperties) {
    var parsed = KsqlGrammar.parse(ksql);
    if (parsed.getStatements().size() > 1) {
      throw new ValidationException("Only single statement supported now");
    }
    if (parsed.getStatements().isEmpty()) {
      throw new ValidationException("No valid ksql statement found");
    }
    if (KsqlGrammar.isSelect(parsed.getStatements().get(0))) {
      return executeSelect(ksql, streamProperties);
    } else {
      return executeStatement(ksql, streamProperties);
    }
  }

}
