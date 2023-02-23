package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.model.ApplicationPropertyValidationDTO;
import com.provectus.kafka.ui.model.ClusterConfigValidationDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@UtilityClass
public class KafkaClusterValidator {

  public static Mono<ClusterConfigValidationDTO> validate(KafkaCluster cluster) {
    return Mono.zip(
        validateCluster(cluster),
        validateSchemaRegistry(cluster),
        validateConnect(cluster),
        validateKsql(cluster)
    ).map(tuple -> {
      var validation = new ClusterConfigValidationDTO();
      validation.kafka(tuple.getT1());
      tuple.getT2().ifPresent(validation::schemaRegistry);
      tuple.getT3().ifPresent(validation::kafkaConnects);
      tuple.getT4().ifPresent(validation::ksqldb);
      return validation;
    });
  }

  private static Mono<ApplicationPropertyValidationDTO> valid() {
    return Mono.just(new ApplicationPropertyValidationDTO().error(false));
  }

  private static Mono<ApplicationPropertyValidationDTO> invalid(String errorMsg) {
    return Mono.just(new ApplicationPropertyValidationDTO().error(true).errorMessage(errorMsg));
  }

  private static Mono<ApplicationPropertyValidationDTO> invalid(Throwable th) {
    return Mono.just(new ApplicationPropertyValidationDTO().error(true).errorMessage(th.getMessage()));
  }

  private static Mono<ApplicationPropertyValidationDTO> validateCluster(KafkaCluster cluster) {
    // editing properties to make validation faster
    Properties properties = new Properties();
    SslPropertiesUtil.addKafkaSslProperties(cluster.getOriginalProperties().getSsl(), properties);
    properties.putAll(cluster.getProperties());
    properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    properties.put(AdminClientConfig.RETRIES_CONFIG, 1);
    properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5_000);
    properties.put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, 5_000);
    properties.put(AdminClientConfig.CLIENT_ID_CONFIG, "kui-admin-client-validation-" + System.currentTimeMillis());
    AdminClient adminClient = null;
    try {
      adminClient = AdminClient.create(properties);
    } catch (Exception e) {
      log.error("Error creating admin client during validation ", e);
      return invalid("Error while creating AdminClient, check bootstrapServers availability");
    }
    return Mono.just(adminClient)
        .then(ReactiveAdminClient.toMono(adminClient.listTopics().names()))
        .then(valid())
        .doOnTerminate(adminClient::close)
        .onErrorResume(th -> {
          log.error("Error connecting to cluster", th);
          return KafkaClusterValidator.invalid("Error connecting to cluster. See logs for details.");
        });
  }

  private static Mono<Optional<ApplicationPropertyValidationDTO>> validateSchemaRegistry(KafkaCluster cluster) {
    if (cluster.getSchemaRegistryClient() == null) {
      return Mono.just(Optional.empty());
    }
    return cluster.getSchemaRegistryClient()
        .mono(KafkaSrClientApi::getGlobalCompatibilityLevel)
        .then(valid())
        .onErrorResume(KafkaClusterValidator::invalid)
        .map(Optional::of);
  }

  private static Mono<Optional<Map<String, ApplicationPropertyValidationDTO>>> validateConnect(KafkaCluster cluster) {
    if (cluster.getConnectsClients() == null) {
      return Mono.just(Optional.empty());
    }
    return Flux.fromIterable(cluster.getConnectsClients().entrySet())
        .flatMap(e -> {
          var connectName = e.getKey();
          var client = e.getValue();
          var validationResultMono = client.flux(KafkaConnectClientApi::getConnectorPlugins)
              .collectList()
              .then(valid())
              .onErrorResume(KafkaClusterValidator::invalid);
          return validationResultMono.map(validationResult -> Tuples.of(connectName, validationResult));
        })
        .collectMap(Tuple2::getT1, Tuple2::getT2)
        .map(Optional::of);
  }

  private Mono<Optional<ApplicationPropertyValidationDTO>> validateKsql(KafkaCluster cluster) {
    if (cluster.getKsqlClient() == null) {
      return Mono.just(Optional.empty());
    }
    return cluster.getKsqlClient().flux(c -> c.execute("SHOW VARIABLES;", Map.of()))
        .collectList()
        .flatMap(ksqlResults ->
            Flux.fromIterable(ksqlResults)
                .filter(KsqlApiClient.KsqlResponseTable::isError)
                .flatMap(err -> invalid("Error response from ksql: " + err))
                .next()
                .switchIfEmpty(valid())
        )
        .onErrorResume(KafkaClusterValidator::invalid)
        .map(Optional::of);
  }

}
