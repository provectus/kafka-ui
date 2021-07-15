package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.client.KsqlClient;
import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.KsqlDbNotFoundException;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KsqlCommand;
import com.provectus.kafka.ui.strategy.ksqlStatement.KsqlStatementStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KsqlService {
  private final KsqlClient ksqlClient;
  private final ClustersStorage clustersStorage;
  private final List<KsqlStatementStrategy> commandParamsStrategies;

  public Mono<Object> getListStreams(String name, Mono<KsqlCommand> ksqlCommand) {
    return Mono.justOrEmpty(clustersStorage.getClusterByName(name))
            .switchIfEmpty(Mono.error(ClusterNotFoundException::new))
            .map(KafkaCluster::getKsqldbServer)
            .switchIfEmpty(Mono.error(KsqlDbNotFoundException::new))
            .flatMap(host -> getStatementStrategyForKsqlCommand(ksqlCommand)
                    .map(statement -> statement.host(host))
            )
            .flatMap(statement -> ksqlClient.execute(statement));
  }

  private Mono<KsqlStatementStrategy> getStatementStrategyForKsqlCommand(Mono<KsqlCommand> ksqlCommand) {
    return ksqlCommand
            .map(command -> commandParamsStrategies.stream()
                    .filter(s -> s.test(command.getKsql()))
                    .map(s -> s.ksqlCommand(command))
                    .findFirst())
            .flatMap(Mono::justOrEmpty)
// TODO: how to handle not parsed statements?
            .switchIfEmpty(Mono.error(new UnprocessableEntityException("Invalid sql")));
  }
}
