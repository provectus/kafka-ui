package com.provectus.kafka.ui.service.ksql;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient.KsqlResponseTable;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import lombok.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class KsqlServiceV2 {

  @Value
  private static class KsqlExecuteCommand {
    KafkaCluster cluster;
    String ksql;
    Map<String, String> streamProperties;
  }

  private final Cache<String, KsqlExecuteCommand> registeredCommands =
      CacheBuilder.newBuilder()
          .expireAfterWrite(1, TimeUnit.MINUTES)
          .build();

  public String registerCommand(KafkaCluster cluster,
                                String ksql,
                                Map<String, String> streamProperties) {
    String uuid = UUID.randomUUID().toString();
    registeredCommands.put(uuid, new KsqlExecuteCommand(cluster, ksql, streamProperties));
    return uuid;
  }

  public Flux<KsqlResponseTable> execute(String commandId) {
    var cmd = registeredCommands.getIfPresent(commandId);
    if (cmd == null) {
      throw new ValidationException("No command registered with id " + commandId);
    }
    registeredCommands.invalidate(commandId);
    return new KsqlApiClient(cmd.cluster)
        .execute(cmd.ksql, cmd.streamProperties);
  }

}
