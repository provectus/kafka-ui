package com.provectus.kafka.ui.service.ksql;

import static ksql.KsqlGrammarParser.DefineVariableContext;
import static ksql.KsqlGrammarParser.PrintTopicContext;
import static ksql.KsqlGrammarParser.SingleStatementContext;
import static ksql.KsqlGrammarParser.UndefineVariableContext;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.service.ksql.response.ResponseParser;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.codec.DecodingException;
import org.springframework.http.MediaType;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
public class KsqlApiClient {

  private static final MimeType KQL_API_MIME_TYPE = MimeTypeUtils.parseMimeType("application/vnd.ksql.v1+json");

  private static final Set<Class<?>> UNSUPPORTED_STMT_TYPES = Set.of(
      PrintTopicContext.class,
      DefineVariableContext.class,
      UndefineVariableContext.class
  );

  @Builder(toBuilder = true)
  @Value
  public static class KsqlResponseTable {
    String header;
    List<String> columnNames;
    List<List<JsonNode>> values;
    boolean error;

    public Optional<JsonNode> getColumnValue(List<JsonNode> row, String column) {
      int colIdx = columnNames.indexOf(column);
      return colIdx >= 0
          ? Optional.ofNullable(row.get(colIdx))
          : Optional.empty();
    }
  }

  @Value
  private static class KsqlRequest {
    String ksql;
    Map<String, String> streamsProperties;
  }

  //--------------------------------------------------------------------------------------------

  private final String baseUrl;
  private final WebClient webClient;

  public KsqlApiClient(String baseUrl,
                       @Nullable ClustersProperties.KsqldbServerAuth ksqldbServerAuth,
                       @Nullable ClustersProperties.TruststoreConfig ksqldbServerSsl,
                       @Nullable ClustersProperties.KeystoreConfig keystoreConfig,
                       @Nullable DataSize maxBuffSize) {
    this.baseUrl = baseUrl;
    this.webClient = webClient(ksqldbServerAuth, ksqldbServerSsl, keystoreConfig, maxBuffSize);
  }

  private static WebClient webClient(@Nullable ClustersProperties.KsqldbServerAuth ksqldbServerAuth,
                                     @Nullable ClustersProperties.TruststoreConfig truststoreConfig,
                                     @Nullable ClustersProperties.KeystoreConfig keystoreConfig,
                                     @Nullable DataSize maxBuffSize) {
    ksqldbServerAuth = Optional.ofNullable(ksqldbServerAuth).orElse(new ClustersProperties.KsqldbServerAuth());
    maxBuffSize = Optional.ofNullable(maxBuffSize).orElse(DataSize.ofMegabytes(20));

    return new WebClientConfigurator()
        .configureSsl(truststoreConfig, keystoreConfig)
        .configureBasicAuth(
            ksqldbServerAuth.getUsername(),
            ksqldbServerAuth.getPassword()
        )
        .configureBufferSize(maxBuffSize)
        .configureCodecs(codecs -> {
          var mapper = new JsonMapper();
          codecs.defaultCodecs()
              .jackson2JsonEncoder(new Jackson2JsonEncoder(mapper, KQL_API_MIME_TYPE, APPLICATION_JSON));
          // some ksqldb versions do not set content-type header in response,
          // but we still need to use JsonDecoder for it
          codecs.defaultCodecs()
              .jackson2JsonDecoder(new Jackson2JsonDecoder(mapper, MimeTypeUtils.ALL));
        })
        .build();
  }

  private KsqlRequest ksqlRequest(String ksql, Map<String, String> streamProperties) {
    return new KsqlRequest(ksql, streamProperties);
  }

  private Flux<KsqlResponseTable> executeSelect(String ksql, Map<String, String> streamProperties) {
    return webClient
        .post()
        .uri(baseUrl + "/query")
        .accept(new MediaType(KQL_API_MIME_TYPE))
        .contentType(new MediaType(KQL_API_MIME_TYPE))
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
    return webClient
        .post()
        .uri(baseUrl + "/ksql")
        .accept(new MediaType(KQL_API_MIME_TYPE))
        .contentType(APPLICATION_JSON)
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
