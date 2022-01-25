package com.provectus.kafka.ui.service.ksql;

import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.service.ksql.KsqlApiClient.KsqlResponseTable;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.*;

@Service
public class KsqlServiceV2 {

  private static final Object CLOSE_PIPE_MARKER = new Object();
  private final Map<String, Pipe> registeredPipes = new ConcurrentHashMap<>();

  private static class Pipe {
    SynchronousQueue<Object> queue = new SynchronousQueue<>();
    volatile Disposable sourceSubscription;

    @SneakyThrows
    void err(Throwable th) {
      queue.put(th);
    }

    @SneakyThrows
    void next(KsqlResponseTable t) {
      queue.put(t);
    }

    @SneakyThrows
    void close() {
      queue.put(CLOSE_PIPE_MARKER);
    }
  }


  public Flux<KsqlResponseTable> registerPipe(String pipeId) {
    var p = new Pipe();
    if (registeredPipes.put(pipeId, p) != null) {
      throw new ValidationException(String.format("Pipe with id %s already registered", pipeId));
    }
    Runnable cleaning = () -> {
      System.out.println("removing pipe " + pipeId);
      registeredPipes.remove(pipeId);
      if (p.sourceSubscription != null) {
        p.sourceSubscription.dispose();
      }
    };
    return Flux.create(sink -> {
      while (true) {
        try {
          var r = p.queue.poll(1, TimeUnit.SECONDS);
          if (sink.isCancelled()) {
            cleaning.run();
            break;
          }
          if (r == null) {
            continue;
          }
          if (r == CLOSE_PIPE_MARKER) {
            sink.complete();
            cleaning.run();
            break;
          }
          if (r instanceof Throwable) {
            sink.error((Throwable) r);
            cleaning.run();
            break;
          }
          if (r instanceof KsqlResponseTable) {
            sink.next((KsqlResponseTable) r);
          }
        } catch (InterruptedException e) {
          sink.error(e); //todo maybe complete ?
          cleaning.run();
          break;
        }
      }
    });
  }

  public void execute(KafkaCluster cluster,
                      String pipeId,
                      String ksql,
                      Map<String, String> streamProperties) {
    System.out.println("pipes: " + registeredPipes.keySet());
    var pipe = Objects.requireNonNull(registeredPipes.get(pipeId), "Pipe not found");
    var dispose = new KsqlApiClient(cluster)
        .execute(ksql, streamProperties)
        .subscribe(pipe::next, pipe::err, pipe::close);
    pipe.sourceSubscription = dispose;
  }

}
