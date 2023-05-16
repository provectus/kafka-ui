package com.provectus.kafka.ui.util;

import static com.provectus.kafka.ui.config.ClustersProperties.TruststoreConfig;

import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.model.ApplicationPropertyValidationDTO;
import com.provectus.kafka.ui.service.ReactiveAdminClient;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.function.Supplier;
import javax.annotation.Nullable;
import javax.net.ssl.TrustManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.util.ResourceUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
public final class KafkaServicesValidation {

  private KafkaServicesValidation() {
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

  /**
   * Returns error msg, if any.
   */
  public static Optional<String> validateTruststore(TruststoreConfig truststoreConfig) {
    if (truststoreConfig.getTruststoreLocation() != null && truststoreConfig.getTruststorePassword() != null) {
      try (FileInputStream fileInputStream = new FileInputStream(
             (ResourceUtils.getFile(truststoreConfig.getTruststoreLocation())))) {
        KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        trustStore.load(fileInputStream, truststoreConfig.getTruststorePassword().toCharArray());
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(
            TrustManagerFactory.getDefaultAlgorithm()
        );
        trustManagerFactory.init(trustStore);
      } catch (Exception e) {
        return Optional.of(e.getMessage());
      }
    }
    return Optional.empty();
  }

  public static Mono<ApplicationPropertyValidationDTO> validateClusterConnection(String bootstrapServers,
                                                                                 Properties clusterProps,
                                                                                 @Nullable
                                                                                 TruststoreConfig ssl) {
    Properties properties = new Properties();
    SslPropertiesUtil.addKafkaSslProperties(ssl, properties);
    properties.putAll(clusterProps);
    properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    // editing properties to make validation faster
    properties.put(AdminClientConfig.RETRIES_CONFIG, 1);
    properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5_000);
    properties.put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, 5_000);
    properties.put(AdminClientConfig.CLIENT_ID_CONFIG, "kui-admin-client-validation-" + System.currentTimeMillis());
    AdminClient adminClient = null;
    try {
      adminClient = AdminClient.create(properties);
    } catch (Exception e) {
      log.error("Error creating admin client during validation", e);
      return invalid("Error while creating AdminClient. See logs for details.");
    }
    return Mono.just(adminClient)
        .then(ReactiveAdminClient.toMono(adminClient.listTopics().names()))
        .then(valid())
        .doOnTerminate(adminClient::close)
        .onErrorResume(th -> {
          log.error("Error connecting to cluster", th);
          return KafkaServicesValidation.invalid("Error connecting to cluster. See logs for details.");
        });
  }

  public static Mono<ApplicationPropertyValidationDTO> validateSchemaRegistry(
      Supplier<ReactiveFailover<KafkaSrClientApi>> clientSupplier) {
    ReactiveFailover<KafkaSrClientApi> client;
    try {
      client = clientSupplier.get();
    } catch (Exception e) {
      log.error("Error creating Schema Registry client", e);
      return invalid("Error creating Schema Registry client: " + e.getMessage());
    }
    return client
        .mono(KafkaSrClientApi::getGlobalCompatibilityLevel)
        .then(valid())
        .onErrorResume(KafkaServicesValidation::invalid);
  }

  public static Mono<ApplicationPropertyValidationDTO> validateConnect(
      Supplier<ReactiveFailover<KafkaConnectClientApi>> clientSupplier) {
    ReactiveFailover<KafkaConnectClientApi> client;
    try {
      client = clientSupplier.get();
    } catch (Exception e) {
      log.error("Error creating Connect client", e);
      return invalid("Error creating Connect client: " + e.getMessage());
    }
    return client.flux(KafkaConnectClientApi::getConnectorPlugins)
        .collectList()
        .then(valid())
        .onErrorResume(KafkaServicesValidation::invalid);
  }

  public static Mono<ApplicationPropertyValidationDTO> validateKsql(
      Supplier<ReactiveFailover<KsqlApiClient>> clientSupplier) {
    ReactiveFailover<KsqlApiClient> client;
    try {
      client = clientSupplier.get();
    } catch (Exception e) {
      log.error("Error creating Ksql client", e);
      return invalid("Error creating Ksql client: " + e.getMessage());
    }
    return client.flux(c -> c.execute("SHOW VARIABLES;", Map.of()))
        .collectList()
        .flatMap(ksqlResults ->
            Flux.fromIterable(ksqlResults)
                .filter(KsqlApiClient.KsqlResponseTable::isError)
                .flatMap(err -> invalid("Error response from ksql: " + err))
                .next()
                .switchIfEmpty(valid())
        )
        .onErrorResume(KafkaServicesValidation::invalid);
  }


}
