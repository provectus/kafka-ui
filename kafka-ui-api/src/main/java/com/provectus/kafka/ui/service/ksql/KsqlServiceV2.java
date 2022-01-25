package com.provectus.kafka.ui.service.ksql;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient.KsqlResponseTable;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.reactivestreams.Subscription;
import org.springframework.stereotype.Service;
import reactor.core.publisher.BaseSubscriber;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.publisher.SignalType;

@Service
public class KsqlServiceV2 {

  private static class Pipe {
    volatile FluxSink<KsqlResponseTable> sink;
  }

  private final Map<String, Pipe> registeredPipes = new ConcurrentHashMap<>();

  public Flux<KsqlResponseTable> registerPipe(String pipeId) {
    var pipe = new Pipe();
    if (registeredPipes.put(pipeId, pipe) != null) {
      throw new ValidationException(String.format("Pipe with id %s already registered", pipeId));
    }
    return Flux.<KsqlResponseTable>create(sink -> pipe.sink = sink)
        .doFinally(s -> registeredPipes.remove(pipeId));
  }

  public void execute(KafkaCluster cluster,
                      String pipeId,
                      String ksql,
                      Map<String, String> streamProperties) {
    var pipe = Objects.requireNonNull(registeredPipes.get(pipeId), "Pipe not found");
    new KsqlApiClient(cluster)
        .execute(ksql, streamProperties)
        .subscribeWith(new BaseSubscriber<KsqlResponseTable>() {

          @Override
          protected void hookOnSubscribe(Subscription subscription) {
            super.hookOnSubscribe(subscription);
            // if pipe is cancelled we need to cancel subscription too
            pipe.sink.onCancel(this);
          }

          @Override
          protected void hookOnError(Throwable throwable) {
            pipe.sink.error(throwable);
          }

          @Override
          protected void hookOnNext(KsqlResponseTable value) {
            pipe.sink.next(value);
          }

          @Override
          protected void hookFinally(SignalType type) {
            pipe.sink.complete();
          }
        });
  }

}
