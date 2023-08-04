package com.provectus.kafka.ui.service.integration.odd;

import com.provectus.kafka.ui.connect.model.ConnectorTopics;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.KafkaConnectService;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.client.model.DataEntity;
import org.opendatadiscovery.client.model.DataEntityList;
import org.opendatadiscovery.client.model.DataEntityType;
import org.opendatadiscovery.client.model.DataSource;
import org.opendatadiscovery.client.model.DataTransformer;
import org.opendatadiscovery.client.model.MetadataExtension;
import reactor.core.publisher.Flux;

@RequiredArgsConstructor
class ConnectorsExporter {

  private final KafkaConnectService kafkaConnectService;

  Flux<DataEntityList> export(KafkaCluster cluster) {
    return kafkaConnectService.getConnects(cluster)
        .flatMap(connect -> kafkaConnectService.getConnectorNamesWithErrorsSuppress(cluster, connect.getName())
            .flatMap(connectorName -> kafkaConnectService.getConnector(cluster, connect.getName(), connectorName))
            .flatMap(connectorDTO ->
                kafkaConnectService.getConnectorTopics(cluster, connect.getName(), connectorDTO.getName())
                    .map(topics -> createConnectorDataEntity(cluster, connect, connectorDTO, topics)))
            .buffer(100)
            .map(connectDataEntities -> {
              String dsOddrn = Oddrn.connectDataSourceOddrn(connect.getAddress());
              return new DataEntityList()
                  .dataSourceOddrn(dsOddrn)
                  .items(connectDataEntities);
            })
        );
  }

  Flux<DataSource> getConnectDataSources(KafkaCluster cluster) {
    return kafkaConnectService.getConnects(cluster)
        .map(ConnectorsExporter::toDataSource);
  }

  private static DataSource toDataSource(ConnectDTO connect) {
    return new DataSource()
        .oddrn(Oddrn.connectDataSourceOddrn(connect.getAddress()))
        .name(connect.getName())
        .description("Kafka Connect");
  }

  private static DataEntity createConnectorDataEntity(KafkaCluster cluster,
                                                      ConnectDTO connect,
                                                      ConnectorDTO connector,
                                                      ConnectorTopics connectorTopics) {
    var metadata = new HashMap<>(extractMetadata(connector));
    metadata.put("type", connector.getType().name());

    var info = extractConnectorInfo(cluster, connector, connectorTopics);
    DataTransformer transformer = new DataTransformer();
    transformer.setInputs(info.inputs());
    transformer.setOutputs(info.outputs());

    return new DataEntity()
        .oddrn(Oddrn.connectorOddrn(connect.getAddress(), connector.getName()))
        .name(connector.getName())
        .description("Kafka Connector \"%s\" (%s)".formatted(connector.getName(), connector.getType()))
        .type(DataEntityType.JOB)
        .dataTransformer(transformer)
        .metadata(List.of(
            new MetadataExtension()
                .schemaUrl(URI.create("wontbeused.oops"))
                .metadata(metadata)));
  }

  private static Map<String, Object> extractMetadata(ConnectorDTO connector) {
    // will be sanitized by KafkaConfigSanitizer (if it's enabled)
    return connector.getConfig();
  }

  private static ConnectorInfo extractConnectorInfo(KafkaCluster cluster,
                                                    ConnectorDTO connector,
                                                    ConnectorTopics topics) {
    return ConnectorInfo.extract(
        (String) connector.getConfig().get("connector.class"),
        connector.getType(),
        connector.getConfig(),
        topics.getTopics(),
        topic -> Oddrn.topicOddrn(cluster, topic)
    );
  }

}
