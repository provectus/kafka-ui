package com.provectus.kafka.ui.service.integration.odd;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorTypeDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.KafkaConnectService;
import java.util.Map;
import org.junit.jupiter.api.Test;
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

    when(kafkaConnectService.getConnectorNames(CLUSTER, connect.getName()))
        .thenReturn(Flux.just(sinkConnector.getName(), sourceConnector.getName()));

    when(kafkaConnectService.getConnector(CLUSTER, connect.getName(), sinkConnector.getName()))
        .thenReturn(Mono.just(sinkConnector));

    when(kafkaConnectService.getConnector(CLUSTER, connect.getName(), sourceConnector.getName()))
        .thenReturn(Mono.just(sourceConnector));

    StepVerifier.create(exporter.export(CLUSTER))
        .assertNext(c -> {
          assertThat(c.getOddrn()).isEqualTo("//kafkaconnect/host/kconnect:8083/connectors/testSink");
          assertThat(c.getMetadata().get(0).getMetadata()).containsKeys("type", "class");
          assertThat(c.getDataTransformer().getInputs()).contains("//kafka/host/localhost:9092/topics/inputTopic");
        })
        .assertNext(c -> {
          assertThat(c.getOddrn()).isEqualTo("//kafkaconnect/host/kconnect:8083/connectors/testSource");
          assertThat(c.getMetadata().get(0).getMetadata()).containsKeys("type", "class");
          assertThat(c.getDataTransformer().getOutputs()).contains("//kafka/host/localhost:9092/topics/outputTopic");
        })
        .verifyComplete();
  }

}
