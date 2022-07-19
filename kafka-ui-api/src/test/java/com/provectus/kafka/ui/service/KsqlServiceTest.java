package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.client.KsqlClient;
import com.provectus.kafka.ui.exception.KsqlDbNotFoundException;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.InternalKsqlServer;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KsqlCommandDTO;
import com.provectus.kafka.ui.model.KsqlCommandResponseDTO;
import com.provectus.kafka.ui.strategy.ksql.statement.BaseStrategy;
import com.provectus.kafka.ui.strategy.ksql.statement.DescribeStrategy;
import com.provectus.kafka.ui.strategy.ksql.statement.ShowStrategy;
import java.util.List;
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
        List.of(baseStrategy, alternativeStrategy)
    );
  }

  @Test
  void shouldThrowKsqlDbNotFoundExceptionOnExecuteKsqlCommand() {
    KsqlCommandDTO command = (new KsqlCommandDTO()).ksql("show streams;");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);
    when(kafkaCluster.getKsqldbServer()).thenReturn(null);

    StepVerifier.create(ksqlService.executeKsqlCommand(kafkaCluster, Mono.just(command)))
        .verifyError(KsqlDbNotFoundException.class);
  }

  @Test
  void shouldThrowUnprocessableEntityExceptionOnExecuteKsqlCommand() {
    KsqlCommandDTO command =
        (new KsqlCommandDTO()).ksql("CREATE STREAM users WITH (KAFKA_TOPIC='users');");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);
    when(kafkaCluster.getKsqldbServer()).thenReturn(InternalKsqlServer.builder().url("localhost:8088").build());

    StepVerifier.create(ksqlService.executeKsqlCommand(kafkaCluster, Mono.just(command)))
        .verifyError(UnprocessableEntityException.class);

    StepVerifier.create(ksqlService.executeKsqlCommand(kafkaCluster, Mono.just(command)))
        .verifyErrorMessage("Invalid sql");
  }

  @Test
  void shouldSetHostToStrategy() {
    String host = "localhost:8088";
    KsqlCommandDTO command = (new KsqlCommandDTO()).ksql("describe streams;");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);

    when(kafkaCluster.getKsqldbServer()).thenReturn(InternalKsqlServer.builder().url(host).build());
    when(ksqlClient.execute(any(), any())).thenReturn(Mono.just(new KsqlCommandResponseDTO()));

    ksqlService.executeKsqlCommand(kafkaCluster, Mono.just(command)).block();
    assertThat(alternativeStrategy.getUri()).isEqualTo(host + "/ksql");
  }

  @Test
  void shouldCallClientAndReturnResponse() {
    KsqlCommandDTO command = (new KsqlCommandDTO()).ksql("describe streams;");
    KafkaCluster kafkaCluster = Mockito.mock(KafkaCluster.class);
    KsqlCommandResponseDTO response = new KsqlCommandResponseDTO().message("success");

    when(kafkaCluster.getKsqldbServer()).thenReturn(InternalKsqlServer.builder().url("host").build());
    when(ksqlClient.execute(any(), any())).thenReturn(Mono.just(response));

    KsqlCommandResponseDTO receivedResponse =
        ksqlService.executeKsqlCommand(kafkaCluster, Mono.just(command)).block();
    verify(ksqlClient, times(1)).execute(eq(alternativeStrategy), any());
    assertThat(receivedResponse).isEqualTo(response);

  }
}
