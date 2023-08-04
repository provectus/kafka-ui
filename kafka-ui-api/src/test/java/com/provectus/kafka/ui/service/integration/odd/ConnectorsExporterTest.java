package com.provectus.kafka.ui.service.integration.odd;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.connect.model.ConnectorTopics;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorTypeDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.KafkaConnectService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.client.model.DataEntity;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class ConnectorsExporterTest {

  private static final KafkaCluster CLUSTER = KafkaCluster.builder()
      .name("test cluster")
      .bootstrapServers("localhost:9092")
      .build();

  private final KafkaConnectService kafkaConnectService = mock(KafkaConnectService.class);
  private final ConnectorsExporter exporter = new ConnectorsExporter(kafkaConnectService);

  @Test
  void exportsConnectorsAsDataTransformers() {
    ConnectDTO connect = new ConnectDTO();
    connect.setName("testConnect");
    connect.setAddress("http://kconnect:8083");

    ConnectorDTO sinkConnector = new ConnectorDTO();
    sinkConnector.setName("testSink");
    sinkConnector.setType(ConnectorTypeDTO.SINK);
    sinkConnector.setConnect(connect.getName());
    sinkConnector.setConfig(
        Map.of(
            "connector.class", "FileStreamSink",
            "file", "filePathHere",
            "topic", "inputTopic"
        )
    );

    ConnectorDTO sourceConnector = new ConnectorDTO();
    sourceConnector.setName("testSource");
    sourceConnector.setConnect(connect.getName());
    sourceConnector.setType(ConnectorTypeDTO.SOURCE);
    sourceConnector.setConfig(
        Map.of(
            "connector.class", "FileStreamSource",
            "file", "filePathHere",
            "topic", "outputTopic"
        )
    );

    when(kafkaConnectService.getConnects(CLUSTER))
        .thenReturn(Flux.just(connect));

    when(kafkaConnectService.getConnectorNamesWithErrorsSuppress(CLUSTER, connect.getName()))
        .thenReturn(Flux.just(sinkConnector.getName(), sourceConnector.getName()));

    when(kafkaConnectService.getConnector(CLUSTER, connect.getName(), sinkConnector.getName()))
        .thenReturn(Mono.just(sinkConnector));

    when(kafkaConnectService.getConnector(CLUSTER, connect.getName(), sourceConnector.getName()))
        .thenReturn(Mono.just(sourceConnector));

    when(kafkaConnectService.getConnectorTopics(CLUSTER, connect.getName(), sourceConnector.getName()))
        .thenReturn(Mono.just(new ConnectorTopics().topics(List.of("outputTopic"))));

    when(kafkaConnectService.getConnectorTopics(CLUSTER, connect.getName(), sinkConnector.getName()))
        .thenReturn(Mono.just(new ConnectorTopics().topics(List.of("inputTopic"))));

    StepVerifier.create(exporter.export(CLUSTER))
        .assertNext(dataEntityList -> {
          assertThat(dataEntityList.getDataSourceOddrn())
              .isEqualTo("//kafkaconnect/host/kconnect:8083");

          assertThat(dataEntityList.getItems())
              .hasSize(2);

          assertThat(dataEntityList.getItems())
              .filteredOn(DataEntity::getOddrn, "//kafkaconnect/host/kconnect:8083/connectors/testSink")
              .singleElement()
              .satisfies(sink -> {
                assertThat(sink.getMetadata().get(0).getMetadata())
                    .containsOnlyKeys("type", "connector.class", "file", "topic");
                assertThat(sink.getDataTransformer().getInputs()).contains(
                    "//kafka/cluster/localhost:9092/topics/inputTopic");
              });

          assertThat(dataEntityList.getItems())
              .filteredOn(DataEntity::getOddrn, "//kafkaconnect/host/kconnect:8083/connectors/testSource")
              .singleElement()
              .satisfies(source -> {
                assertThat(source.getMetadata().get(0).getMetadata())
                    .containsOnlyKeys("type", "connector.class", "file", "topic");
                assertThat(source.getDataTransformer().getOutputs()).contains(
                    "//kafka/cluster/localhost:9092/topics/outputTopic");
              });

        })
        .verifyComplete();
  }

}
