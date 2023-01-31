package com.provectus.kafka.ui.service.integrations.odd;

import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.KafkaConnectService;
import com.provectus.kafka.ui.service.StatisticsCache;
import java.util.List;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import lombok.SneakyThrows;
import org.opendatadiscovery.client.ApiClient;
import org.opendatadiscovery.client.api.OpenDataDiscoveryIngestionApi;
import org.opendatadiscovery.client.model.DataEntity;
import org.opendatadiscovery.client.model.DataEntityList;
import org.opendatadiscovery.client.model.DataSource;
import org.opendatadiscovery.client.model.DataSourceList;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

class OddExporter {

  private final OpenDataDiscoveryIngestionApi oddApi;
  private final TopicsExporter topicsExporter;
  private final ConnectorsExporter connectorsExporter;

  public OddExporter(StatisticsCache statisticsCache,
                     KafkaConnectService connectService,
                     OddIntegrationProperties oddIntegrationProperties) {
    this(
        createApiClient(oddIntegrationProperties),
        new TopicsExporter(createTopicsFilter(oddIntegrationProperties), statisticsCache),
        new ConnectorsExporter(connectService)
    );
  }

  OddExporter(OpenDataDiscoveryIngestionApi oddApi, TopicsExporter topicsExporter,
              ConnectorsExporter connectorsExporter) {
    this.oddApi = oddApi;
    this.topicsExporter = topicsExporter;
    this.connectorsExporter = connectorsExporter;
  }

  @SneakyThrows
  public Mono<Void> export(KafkaCluster cluster) {
    return exportTopics(cluster)
        .then(exportKafkaConnects(cluster))
        .then();
  }

  private Mono<Void> exportTopics(KafkaCluster c) {
    String clusterOddrn = Oddrn.clusterOddrn(c);
    return createClusterDatasourceIfNeeded(c)
        .thenMany(topicsExporter.export(c))
        .buffer(20)
        .flatMapSequential(entities -> sentDataEntities(clusterOddrn, entities))
        .then();
  }

  private Mono<Void> exportKafkaConnects(KafkaCluster cluster) {
    String clusterOddrn = Oddrn.clusterOddrn(cluster);
    return connectorsExporter.export(cluster)
        .buffer(100)
        .flatMapSequential(entities -> sentDataEntities(clusterOddrn, entities))
        .then();
  }

  private Mono<Void> createClusterDatasourceIfNeeded(KafkaCluster cluster) {
    String clusterOddrn = Oddrn.clusterOddrn(cluster);
    return oddApi.getDataEntitiesByDEGOddrn(clusterOddrn)
        .map(r -> !r.getItems().isEmpty())
        .onErrorResume(WebClientResponseException.NotFound.class, throwable -> Mono.just(false))
        .filter(created -> !created)
        .flatMap(notFound ->
            oddApi.createDataSource(
                new DataSourceList()
                    .addItemsItem(
                        new DataSource()
                            .oddrn(clusterOddrn)
                            .name("Kafka cluster \"%s\"".formatted(cluster.getName()))
                            .description("Kafka cluster, exported from kafka-ui")
                    )
            ));
  }

  private Mono<Void> sentDataEntities(String datasourceOddrn, List<DataEntity> entities) {
    return oddApi.postDataEntityList(
        new DataEntityList()
            .dataSourceOddrn(datasourceOddrn)
            .items(entities)
    );
  }

  private static Predicate<String> createTopicsFilter(OddIntegrationProperties properties) {
    if (properties.getTopicsRegex() == null) {
      return topic -> !topic.startsWith("_");
    }
    Pattern pattern = Pattern.compile(properties.getTopicsRegex());
    return topic -> pattern.matcher(topic).matches();
  }

  private static OpenDataDiscoveryIngestionApi createApiClient(OddIntegrationProperties properties) {
    if (properties.getPlatformUrl() == null) {
      return null;
    }
    var apiClient = new ApiClient()
        .setBasePath(properties.getPlatformUrl())
        .addDefaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken());
    return new OpenDataDiscoveryIngestionApi(apiClient);
  }

}
