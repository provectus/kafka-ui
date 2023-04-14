package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.client.RetryingKafkaConnectClient;
import com.provectus.kafka.ui.config.ClustersProperties;
import com.provectus.kafka.ui.config.WebclientProperties;
import com.provectus.kafka.ui.connect.api.KafkaConnectClientApi;
import com.provectus.kafka.ui.emitter.PollingSettings;
import com.provectus.kafka.ui.model.ApplicationPropertyValidationDTO;
import com.provectus.kafka.ui.model.ClusterConfigValidationDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.MetricsConfig;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient;
import com.provectus.kafka.ui.service.masking.DataMasking;
import com.provectus.kafka.ui.sr.ApiClient;
import com.provectus.kafka.ui.sr.api.KafkaSrClientApi;
import com.provectus.kafka.ui.util.KafkaServicesValidation;
import com.provectus.kafka.ui.util.ReactiveFailover;
import com.provectus.kafka.ui.util.WebClientConfigurator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

@Service
@Slf4j
public class KafkaClusterFactory {

  private static final DataSize DEFAULT_WEBCLIENT_BUFFER = DataSize.parse("20MB");

  private final DataSize webClientMaxBuffSize;

  public KafkaClusterFactory(WebclientProperties webclientProperties) {
    this.webClientMaxBuffSize = Optional.ofNullable(webclientProperties.getMaxInMemoryBufferSize())
        .map(DataSize::parse)
        .orElse(DEFAULT_WEBCLIENT_BUFFER);
  }

  public KafkaCluster create(ClustersProperties properties,
                             ClustersProperties.Cluster clusterProperties) {
    KafkaCluster.KafkaClusterBuilder builder = KafkaCluster.builder();

    builder.name(clusterProperties.getName());
    builder.bootstrapServers(clusterProperties.getBootstrapServers());
    builder.properties(convertProperties(clusterProperties.getProperties()));
    builder.readOnly(clusterProperties.isReadOnly());
    builder.masking(DataMasking.create(clusterProperties.getMasking()));
    builder.pollingSettings(PollingSettings.create(clusterProperties, properties));

    if (schemaRegistryConfigured(clusterProperties)) {
      builder.schemaRegistryClient(schemaRegistryClient(clusterProperties));
    }
    if (connectClientsConfigured(clusterProperties)) {
      builder.connectsClients(connectClients(clusterProperties));
    }
    if (ksqlConfigured(clusterProperties)) {
      builder.ksqlClient(ksqlClient(clusterProperties));
    }
    if (metricsConfigured(clusterProperties)) {
      builder.metricsConfig(metricsConfigDataToMetricsConfig(clusterProperties.getMetrics()));
    }
    builder.originalProperties(clusterProperties);
    return builder.build();
  }

  public Mono<ClusterConfigValidationDTO> validate(ClustersProperties.Cluster clusterProperties) {
    if (clusterProperties.getSsl() != null) {
      Optional<String> errMsg = KafkaServicesValidation.validateTruststore(clusterProperties.getSsl());
      if (errMsg.isPresent()) {
        return Mono.just(new ClusterConfigValidationDTO()
            .kafka(new ApplicationPropertyValidationDTO()
                .error(true)
                .errorMessage("Truststore not valid: " + errMsg.get())));
      }
    }

    return Mono.zip(
        KafkaServicesValidation.validateClusterConnection(
            clusterProperties.getBootstrapServers(),
            convertProperties(clusterProperties.getProperties()),
            clusterProperties.getSsl()
        ),
        schemaRegistryConfigured(clusterProperties)
            ? KafkaServicesValidation.validateSchemaRegistry(
                () -> schemaRegistryClient(clusterProperties)).map(Optional::of)
            : Mono.<Optional<ApplicationPropertyValidationDTO>>just(Optional.empty()),

        ksqlConfigured(clusterProperties)
            ? KafkaServicesValidation.validateKsql(() -> ksqlClient(clusterProperties)).map(Optional::of)
            : Mono.<Optional<ApplicationPropertyValidationDTO>>just(Optional.empty()),

        connectClientsConfigured(clusterProperties)
            ?
            Flux.fromIterable(clusterProperties.getKafkaConnect())
                .flatMap(c ->
                    KafkaServicesValidation.validateConnect(() -> connectClient(clusterProperties, c))
                        .map(r -> Tuples.of(c.getName(), r)))
                .collectMap(Tuple2::getT1, Tuple2::getT2)
                .map(Optional::of)
            :
            Mono.<Optional<Map<String, ApplicationPropertyValidationDTO>>>just(Optional.empty())
    ).map(tuple -> {
      var validation = new ClusterConfigValidationDTO();
      validation.kafka(tuple.getT1());
      tuple.getT2().ifPresent(validation::schemaRegistry);
      tuple.getT3().ifPresent(validation::ksqldb);
      tuple.getT4().ifPresent(validation::kafkaConnects);
      return validation;
    });
  }

  private Properties convertProperties(Map<String, Object> propertiesMap) {
    Properties properties = new Properties();
    if (propertiesMap != null) {
      properties.putAll(propertiesMap);
    }
    return properties;
  }

  private boolean connectClientsConfigured(ClustersProperties.Cluster clusterProperties) {
    return clusterProperties.getKafkaConnect() != null;
  }

  private Map<String, ReactiveFailover<KafkaConnectClientApi>> connectClients(
      ClustersProperties.Cluster clusterProperties) {
    Map<String, ReactiveFailover<KafkaConnectClientApi>> connects = new HashMap<>();
    clusterProperties.getKafkaConnect().forEach(c -> connects.put(c.getName(), connectClient(clusterProperties, c)));
    return connects;
  }

  private ReactiveFailover<KafkaConnectClientApi> connectClient(ClustersProperties.Cluster cluster,
                                                                ClustersProperties.ConnectCluster connectCluster) {
    return ReactiveFailover.create(
        parseUrlList(connectCluster.getAddress()),
        url -> new RetryingKafkaConnectClient(
            connectCluster.toBuilder().address(url).build(),
            cluster.getSsl(),
            webClientMaxBuffSize
        ),
        ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
        "No alive connect instances available",
        ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  private boolean schemaRegistryConfigured(ClustersProperties.Cluster clusterProperties) {
    return clusterProperties.getSchemaRegistry() != null;
  }

  private ReactiveFailover<KafkaSrClientApi> schemaRegistryClient(ClustersProperties.Cluster clusterProperties) {
    var auth = Optional.ofNullable(clusterProperties.getSchemaRegistryAuth())
        .orElse(new ClustersProperties.SchemaRegistryAuth());
    WebClient webClient = new WebClientConfigurator()
        .configureSsl(clusterProperties.getSsl(), clusterProperties.getSchemaRegistrySsl())
        .configureBasicAuth(auth.getUsername(), auth.getPassword())
        .configureBufferSize(webClientMaxBuffSize)
        .build();
    return ReactiveFailover.create(
        parseUrlList(clusterProperties.getSchemaRegistry()),
        url -> new KafkaSrClientApi(new ApiClient(webClient, null, null).setBasePath(url)),
        ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
        "No live schemaRegistry instances available",
        ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  private boolean ksqlConfigured(ClustersProperties.Cluster clusterProperties) {
    return clusterProperties.getKsqldbServer() != null;
  }

  private ReactiveFailover<KsqlApiClient> ksqlClient(ClustersProperties.Cluster clusterProperties) {
    return ReactiveFailover.create(
        parseUrlList(clusterProperties.getKsqldbServer()),
        url -> new KsqlApiClient(
            url,
            clusterProperties.getKsqldbServerAuth(),
            clusterProperties.getSsl(),
            clusterProperties.getKsqldbServerSsl(),
            webClientMaxBuffSize
        ),
        ReactiveFailover.CONNECTION_REFUSED_EXCEPTION_FILTER,
        "No live ksqldb instances available",
        ReactiveFailover.DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  private List<String> parseUrlList(String url) {
    return Stream.of(url.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
  }

  private boolean metricsConfigured(ClustersProperties.Cluster clusterProperties) {
    return clusterProperties.getMetrics() != null;
  }

  @Nullable
  private MetricsConfig metricsConfigDataToMetricsConfig(ClustersProperties.MetricsConfigData metricsConfigData) {
    if (metricsConfigData == null) {
      return null;
    }
    MetricsConfig.MetricsConfigBuilder builder = MetricsConfig.builder();
    builder.type(metricsConfigData.getType());
    builder.port(metricsConfigData.getPort());
    builder.ssl(Optional.ofNullable(metricsConfigData.getSsl()).orElse(false));
    builder.username(metricsConfigData.getUsername());
    builder.password(metricsConfigData.getPassword());
    builder.keystoreLocation(metricsConfigData.getKeystoreLocation());
    builder.keystorePassword(metricsConfigData.getKeystorePassword());
    return builder.build();
  }

}
