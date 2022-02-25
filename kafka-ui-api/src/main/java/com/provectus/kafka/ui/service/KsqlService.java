package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.client.KsqlClient;
import com.provectus.kafka.ui.exception.ClusterNotFoundException;
import com.provectus.kafka.ui.exception.KsqlDbNotFoundException;
import com.provectus.kafka.ui.exception.UnprocessableEntityException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.model.KsqlCommandDTO;
import com.provectus.kafka.ui.model.KsqlCommandResponseDTO;
import com.provectus.kafka.ui.strategy.ksql.statement.BaseStrategy;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KsqlService {
  private final KsqlClient ksqlClient;
  private final List<BaseStrategy> ksqlStatementStrategies;

  public Mono<KsqlCommandResponseDTO> executeKsqlCommand(KafkaCluster cluster,
                                                         Mono<KsqlCommandDTO> ksqlCommand) {
    return Mono.justOrEmpty(cluster)
        .map(KafkaCluster::getKsqldbServer)
        .onErrorResume(e -> {
          Throwable throwable =
              e instanceof ClusterNotFoundException ? e : new KsqlDbNotFoundException();
          return Mono.error(throwable);
        })
        .flatMap(host -> getStatementStrategyForKsqlCommand(ksqlCommand)
            .map(statement -> statement.host(host))
        )
        .flatMap(ksqlClient::execute);
  }

  private Mono<BaseStrategy> getStatementStrategyForKsqlCommand(
      Mono<KsqlCommandDTO> ksqlCommand) {
    return ksqlCommand
        .map(command -> ksqlStatementStrategies.stream()
            .filter(s -> s.test(command.getKsql()))
            .map(s -> s.ksqlCommand(command))
            .findFirst())
        .flatMap(Mono::justOrEmpty)
        .switchIfEmpty(Mono.error(new UnprocessableEntityException("Invalid sql")));
  }
}
