package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.client.KsqlClient;
import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.KsqlDbNotFoundException;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KsqlCommand;
import com.provectus.kafka.ui.model.KsqlCommandResponse;
import com.provectus.kafka.ui.strategy.ksql.statement.BaseStrategy;
import com.provectus.kafka.ui.strategy.ksql.statement.DescribeStrategy;
import com.provectus.kafka.ui.strategy.ksql.statement.ShowStrategy;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class KsqlServiceTest {
  private KsqlService ksqlService;
  private BaseStrategy baseStrategy;
  private BaseStrategy alternativeStrategy;

  @Mock
  private ClustersStorage clustersStorage;
  @Mock
  private KsqlClient ksqlClient;


  @BeforeEach
  public void setUp() {
    this.baseStrategy = new ShowStrategy();
    this.alternativeStrategy = new DescribeStrategy();
    this.ksqlService = new KsqlService(
        this.ksqlClient,
        this.clustersStorage,
        List.of(baseStrategy, alternativeStrategy)
    );
  }

  @Test
  void shouldThrowClusterNotFoundExceptionOnExecuteKsqlCommand() {
    String clusterName = "test";
    KsqlCommand command = (new KsqlCommand()).ksql("show streams;");
    when(clustersStorage.getClusterByName(clusterName)).thenReturn(Optional.ofNullable(null));

    StepVerifier.create(ksqlService.executeKsqlCommand(clusterName, Mono.just(command)))
        .verifyError(ClusterNotFoundException.class);
  }

  @Test
  void shouldThrowKsqlDbNotFoundExceptionOnExecuteKsqlCommand() {
    String clusterName = "test";
    KsqlCommand command = (new KsqlCommand()).ksql("show streams;");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);
    when(clustersStorage.getClusterByName(clusterName))
        .thenReturn(Optional.ofNullable(kafkaCluster));
    when(kafkaCluster.getKsqldbServer()).thenReturn(null);

    StepVerifier.create(ksqlService.executeKsqlCommand(clusterName, Mono.just(command)))
        .verifyError(KsqlDbNotFoundException.class);
  }

  @Test
  void shouldThrowUnprocessableEntityExceptionOnExecuteKsqlCommand() {
    String clusterName = "test";
    KsqlCommand command =
        (new KsqlCommand()).ksql("CREATE STREAM users WITH (KAFKA_TOPIC='users');");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);
    when(clustersStorage.getClusterByName(clusterName))
        .thenReturn(Optional.ofNullable(kafkaCluster));
    when(kafkaCluster.getKsqldbServer()).thenReturn("localhost:8088");

    StepVerifier.create(ksqlService.executeKsqlCommand(clusterName, Mono.just(command)))
        .verifyError(UnprocessableEntityException.class);

    StepVerifier.create(ksqlService.executeKsqlCommand(clusterName, Mono.just(command)))
        .verifyErrorMessage("Invalid sql");
  }

  @Test
  void shouldSetHostToStrategy() {
    String clusterName = "test";
    String host = "localhost:8088";
    KsqlCommand command = (new KsqlCommand()).ksql("describe streams;");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);

    when(clustersStorage.getClusterByName(clusterName))
        .thenReturn(Optional.ofNullable(kafkaCluster));
    when(kafkaCluster.getKsqldbServer()).thenReturn(host);
    when(ksqlClient.execute(any())).thenReturn(Mono.just(new KsqlCommandResponse()));

    ksqlService.executeKsqlCommand(clusterName, Mono.just(command)).block();
    assertThat(alternativeStrategy.getUri()).isEqualTo(host + "/ksql");
  }

  @Test
  void shouldCallClientAndReturnResponse() {
    String clusterName = "test";
    KsqlCommand command = (new KsqlCommand()).ksql("describe streams;");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);
    KsqlCommandResponse response = new KsqlCommandResponse().message("success");

    when(clustersStorage.getClusterByName(clusterName))
        .thenReturn(Optional.ofNullable(kafkaCluster));
    when(kafkaCluster.getKsqldbServer()).thenReturn("host");
    when(ksqlClient.execute(any())).thenReturn(Mono.just(response));

    KsqlCommandResponse receivedResponse =
        ksqlService.executeKsqlCommand(clusterName, Mono.just(command)).block();
    verify(ksqlClient, times(1)).execute(alternativeStrategy);
    assertThat(receivedResponse).isEqualTo(response);

  }
}
