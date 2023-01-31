package com.provectus.kafka.ui.service.integrations.odd;

import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.KafkaConnectService;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.client.model.DataEntity;
import org.opendatadiscovery.client.model.DataEntityType;
import org.opendatadiscovery.client.model.DataTransformer;
import org.opendatadiscovery.client.model.MetadataExtension;
import reactor.core.publisher.Flux;

@RequiredArgsConstructor
class ConnectorsExporter {

  private final KafkaConnectService kafkaConnectService;

  Flux<DataEntity> export(KafkaCluster cluster) {
    return kafkaConnectService.getConnects(cluster)
        .map(ConnectDTO::getName)
        .flatMap(connect -> kafkaConnectService.getConnectorNames(cluster, connect)
            .flatMap(connector -> kafkaConnectService.getConnector(cluster, connect, connector))
            .map(connectorDTO -> createConnectorDataEntity(cluster, connectorDTO)));
  }

  private static DataEntity createConnectorDataEntity(KafkaCluster cluster,
                                                      ConnectorDTO connector) {
    var info = extractConnectorInfo(cluster, connector);

    DataTransformer transformer = new DataTransformer();
    transformer.setInputs(info.inputs());
    transformer.setOutputs(info.outputs());

    return new DataEntity()
        .oddrn(Oddrn.connectorOddrn(connector.getConnect(), connector.getName(), cluster))
        //TODO: discuss name generation (maybe include connect/cluster name)
        .name("Kafka Connector \"%s\"".formatted(connector.getName()))
        .type(DataEntityType.JOB)
        .dataTransformer(transformer)
        .metadata(List.of(new MetadataExtension()
            .schemaUrl(URI.create("wontbeused.oops"))
            .metadata(info.metadata())));
  }

  private static ConnectorInfo extractConnectorInfo(KafkaCluster cluster, ConnectorDTO connector) {
    return ConnectorInfo.extract(
        (String) connector.getConfig().get("connector.class"),
        connector.getType(),
        connector.getConfig(),
        topic -> Oddrn.topicOddrn(cluster, topic)
    );
  }

}
