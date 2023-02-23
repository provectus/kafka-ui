package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.config.ClustersProperties;
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
import javax.annotation.Nullable;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.TrustManagerFactory;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.util.ResourceUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Slf4j
@UtilityClass
public class KafkaServicesValidation {

  private Mono<ApplicationPropertyValidationDTO> valid() {
    return Mono.just(new ApplicationPropertyValidationDTO().error(false));
  }

  private Mono<ApplicationPropertyValidationDTO> invalid(String errorMsg) {
    return Mono.just(new ApplicationPropertyValidationDTO().error(true).errorMessage(errorMsg));
  }

  private Mono<ApplicationPropertyValidationDTO> invalid(Throwable th) {
    return Mono.just(new ApplicationPropertyValidationDTO().error(true).errorMessage(th.getMessage()));
  }

  /**
   * Returns error msg, if any.
   */
  public Optional<String> validateTruststore(ClustersProperties.Ssl ssl) {
    if (ssl.getTruststoreLocation() != null && ssl.getTruststorePassword() != null) {
      try {
        KeyStore trustStore = KeyStore.getInstance("JKS");
        trustStore.load(
            new FileInputStream((ResourceUtils.getFile(ssl.getTruststoreLocation()))),
            ssl.getTruststorePassword().toCharArray()
        );
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

  /**
   * Returns error msg, if any.
   */
  public Optional<String> validateKeystore(ClustersProperties.Ssl ssl) {
    if (ssl.getKeystoreLocation() != null && ssl.getKeystorePassword() != null) {
      try {
        KeyStore keyStore = KeyStore.getInstance("JKS");
        keyStore.load(
            new FileInputStream(ResourceUtils.getFile(ssl.getKeystoreLocation())),
            ssl.getKeystorePassword().toCharArray()
        );
        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyManagerFactory.init(keyStore, ssl.getKeystorePassword().toCharArray());
      } catch (Exception e) {
        return Optional.of(e.getMessage());
      }
    }
    return Optional.empty();
  }

  public Mono<ApplicationPropertyValidationDTO> validateClusterConnection(String bootstrapServers,
                                                                          Properties clusterProps,
                                                                          @Nullable ClustersProperties.Ssl ssl) {
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

  public Mono<Optional<ApplicationPropertyValidationDTO>> validateSchemaRegistry(
      ReactiveFailover<KafkaSrClientApi> client) {
    return client
        .mono(KafkaSrClientApi::getGlobalCompatibilityLevel)
        .then(valid())
        .onErrorResume(KafkaServicesValidation::invalid)
        .map(Optional::of);
  }

  public Mono<Optional<Map<String, ApplicationPropertyValidationDTO>>> validateConnect(
      Map<String, ReactiveFailover<KafkaConnectClientApi>> connects) {
    return Flux.fromIterable(connects.entrySet())
        .flatMap(e -> {
          var connectName = e.getKey();
          var client = e.getValue();
          var validationResultMono = client.flux(KafkaConnectClientApi::getConnectorPlugins)
              .collectList()
              .then(valid())
              .onErrorResume(KafkaServicesValidation::invalid);
          return validationResultMono.map(validationResult -> Tuples.of(connectName, validationResult));
        })
        .collectMap(Tuple2::getT1, Tuple2::getT2)
        .map(Optional::of);
  }

  public Mono<Optional<ApplicationPropertyValidationDTO>> validateKsql(ReactiveFailover<KsqlApiClient> ksql) {
    return ksql.flux(c -> c.execute("SHOW VARIABLES;", Map.of()))
        .collectList()
        .flatMap(ksqlResults ->
            Flux.fromIterable(ksqlResults)
                .filter(KsqlApiClient.KsqlResponseTable::isError)
                .flatMap(err -> invalid("Error response from ksql: " + err))
                .next()
                .switchIfEmpty(valid())
        )
        .onErrorResume(KafkaServicesValidation::invalid)
        .map(Optional::of);
  }

}
