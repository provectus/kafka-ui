package com.provectus.kafka.ui.service.ksql;

import static ksql.KsqlGrammarParser.DefineVariableContext;
import static ksql.KsqlGrammarParser.PrintTopicContext;
import static ksql.KsqlGrammarParser.SingleStatementContext;
import static ksql.KsqlGrammarParser.UndefineVariableContext;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ksql.response.ResponseParser;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.Builder;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.codec.DecodingException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.util.MimeTypeUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
public class KsqlApiClient {

  private static final Set<Class<?>> UNSUPPORTED_STMT_TYPES = Set.of(
      PrintTopicContext.class,
      DefineVariableContext.class,
      UndefineVariableContext.class
  );

  @Builder
  @Value
  public static class KsqlResponseTable {
    String header;
    List<String> columnNames;
    List<List<JsonNode>> values;

    public Optional<JsonNode> getColumnValue(List<JsonNode> row, String column) {
      return Optional.ofNullable(row.get(columnNames.indexOf(column)));
    }
  }

  @Value
  private static class KsqlRequest {
    String ksql;
    Map<String, String> streamsProperties;
  }

  //--------------------------------------------------------------------------------------------

  private final KafkaCluster cluster;
  private final DataSize maxBuffSize;

  public KsqlApiClient(KafkaCluster cluster, DataSize maxBuffSize) {
    this.cluster = cluster;
    this.maxBuffSize = maxBuffSize;
  }

  private WebClient webClient() {
    var exchangeStrategies = ExchangeStrategies.builder()
        .codecs(configurer -> {
          configurer.customCodecs()
              .register(
                  new Jackson2JsonDecoder(
                      new ObjectMapper(),
                      // some ksqldb versions do not set content-type header in response,
                      // but we still need to use JsonDecoder for it
                      MimeTypeUtils.APPLICATION_OCTET_STREAM));
        })
        .build();
    return WebClient.builder()
        .codecs(c -> c.defaultCodecs().maxInMemorySize((int) maxBuffSize.toBytes()))
        .defaultHeaders(httpHeaders -> setBasicAuthIfEnabled(httpHeaders, cluster))
        .exchangeStrategies(exchangeStrategies)
        .build();
  }

  public static void setBasicAuthIfEnabled(HttpHeaders headers, KafkaCluster cluster) {
    String username = cluster.getKsqldbServer().getUsername();
    String password = cluster.getKsqldbServer().getPassword();
    if (username != null && password != null) {
      headers.setBasicAuth(username, password);
    } else if (username != null) {
      throw new ValidationException("You specified username but did not specify password");
    } else if (password != null) {
      throw new ValidationException("You specified password but did not specify username");
    }
  }

  private String baseKsqlDbUri() {
    return cluster.getKsqldbServer().getUrl();
  }

  private KsqlRequest ksqlRequest(String ksql, Map<String, String> streamProperties) {
    return new KsqlRequest(ksql, streamProperties);
  }

  private Flux<KsqlResponseTable> executeSelect(String ksql, Map<String, String> streamProperties) {
    return webClient()
        .post()
        .uri(baseKsqlDbUri() + "/query")
        .accept(MediaType.parseMediaType("application/vnd.ksql.v1+json"))
        .contentType(MediaType.parseMediaType("application/vnd.ksql.v1+json"))
        .bodyValue(ksqlRequest(ksql, streamProperties))
        .retrieve()
        .bodyToFlux(JsonNode.class)
        .onErrorResume(this::isUnexpectedJsonArrayEndCharException, th -> Mono.empty())
        .map(ResponseParser::parseSelectResponse)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .onErrorResume(WebClientResponseException.class,
            e -> Flux.just(ResponseParser.parseErrorResponse(e)));
  }

  /**
   * Some version of ksqldb (?..0.24) can cut off json streaming without respect proper array ending like <p/>
   * <code>[{"header":{"queryId":"...","schema":"..."}}, ]</code>
   * which will cause json parsing error and will be propagated to UI.
   * This is a know issue(https://github.com/confluentinc/ksql/issues/8746), but we don't know when it will be fixed.
   * To workaround this we need to check DecodingException err msg.
   */
  private boolean isUnexpectedJsonArrayEndCharException(Throwable th) {
    return th instanceof DecodingException
        && th.getMessage().contains("Unexpected character (']'");
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
    var parsedStatements = KsqlGrammar.parse(ksql);
    if (parsedStatements.isEmpty()) {
      return errorTableFlux("Sql statement is invalid or unsupported");
    }
    var statements = parsedStatements.get().getStatements();
    if (statements.size() > 1) {
      return errorTableFlux("Only single statement supported now");
    }
    if (statements.size() == 0) {
      return errorTableFlux("No valid ksql statement found");
    }
    if (isUnsupportedStatementType(statements.get(0))) {
      return errorTableFlux("Unsupported statement type");
    }
    Flux<KsqlResponseTable> outputFlux;
    if (KsqlGrammar.isSelect(statements.get(0))) {
      outputFlux = executeSelect(ksql, streamProperties);
    } else {
      outputFlux = executeStatement(ksql, streamProperties);
    }
    return outputFlux.onErrorResume(Exception.class,
        e -> {
          log.error("Unexpected error while execution ksql: {}", ksql, e);
          return errorTableFlux("Unexpected error: " + e.getMessage());
        });
  }

  private Flux<KsqlResponseTable> errorTableFlux(String errorText) {
    return Flux.just(ResponseParser.errorTableWithTextMsg(errorText));
  }

  private boolean isUnsupportedStatementType(SingleStatementContext context) {
    var ctxClass = context.statement().getClass();
    return UNSUPPORTED_STMT_TYPES.contains(ctxClass);
  }

}
