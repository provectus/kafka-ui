package com.provectus.kafka.ui.service.integration.odd;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.KafkaConnectService;
import com.provectus.kafka.ui.service.StatisticsCache;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import org.opendatadiscovery.client.ApiClient;
import org.opendatadiscovery.client.api.OpenDataDiscoveryIngestionApi;
import org.opendatadiscovery.client.model.DataEntityList;
import org.opendatadiscovery.client.model.DataSource;
import org.opendatadiscovery.client.model.DataSourceList;
import org.springframework.http.HttpHeaders;
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

  @VisibleForTesting
  OddExporter(OpenDataDiscoveryIngestionApi oddApi,
              TopicsExporter topicsExporter,
              ConnectorsExporter connectorsExporter) {
    this.oddApi = oddApi;
    this.topicsExporter = topicsExporter;
    this.connectorsExporter = connectorsExporter;
  }

  private static Predicate<String> createTopicsFilter(OddIntegrationProperties properties) {
    if (properties.getTopicsRegex() == null) {
      return topic -> !topic.startsWith("_");
    }
    Pattern pattern = Pattern.compile(properties.getTopicsRegex());
    return topic -> pattern.matcher(topic).matches();
  }

  private static OpenDataDiscoveryIngestionApi createApiClient(OddIntegrationProperties properties) {
    Preconditions.checkNotNull(properties.getUrl(), "ODD url not set");
    Preconditions.checkNotNull(properties.getToken(), "ODD token not set");
    var apiClient = new ApiClient()
        .setBasePath(properties.getUrl())
        .addDefaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken());
    return new OpenDataDiscoveryIngestionApi(apiClient);
  }

  public Mono<Void> export(KafkaCluster cluster) {
    return exportTopics(cluster)
        .then(exportKafkaConnects(cluster));
  }

  private Mono<Void> exportTopics(KafkaCluster c) {
    return createKafkaDataSource(c)
        .thenMany(topicsExporter.export(c))
        .concatMap(this::sendDataEntities)
        .then();
  }

  private Mono<Void> exportKafkaConnects(KafkaCluster cluster) {
    return createConnectDataSources(cluster)
        .thenMany(connectorsExporter.export(cluster))
        .concatMap(this::sendDataEntities)
        .then();
  }

  private Mono<Void> createConnectDataSources(KafkaCluster cluster) {
    return connectorsExporter.getConnectDataSources(cluster)
        .buffer(100)
        .concatMap(dataSources -> oddApi.createDataSource(new DataSourceList().items(dataSources)))
        .then();
  }

  private Mono<Void> createKafkaDataSource(KafkaCluster cluster) {
    String clusterOddrn = Oddrn.clusterOddrn(cluster);
    return oddApi.createDataSource(
        new DataSourceList()
            .addItemsItem(
                new DataSource()
                    .oddrn(clusterOddrn)
                    .name(cluster.getName())
                    .description("Kafka cluster")
            )
    );
  }

  private Mono<Void> sendDataEntities(DataEntityList dataEntityList) {
    return oddApi.postDataEntityList(dataEntityList);
  }

}
