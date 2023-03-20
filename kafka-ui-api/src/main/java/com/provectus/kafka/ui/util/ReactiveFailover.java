package com.provectus.kafka.ui.util;

import com.google.common.base.Preconditions;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class ReactiveFailover<T> {

  public static final Duration DEFAULT_RETRY_GRACE_PERIOD_MS = Duration.ofSeconds(5);
  public static final Predicate<Throwable> CONNECTION_REFUSED_EXCEPTION_FILTER =
      error -> error.getCause() instanceof IOException && error.getCause().getMessage().contains("Connection refused");

  private final List<PublisherHolder<T>> publishers;
  private int currentIndex = 0;

  private final Predicate<Throwable> failoverExceptionsPredicate;
  private final String noAvailablePublishersMsg;

  // creates single-publisher failover (basically for tests usage)
  public static <T> ReactiveFailover<T> createNoop(T publisher) {
    return create(
        List.of(publisher),
        th -> true,
        "publisher is not available",
        DEFAULT_RETRY_GRACE_PERIOD_MS
    );
  }

  public static <T> ReactiveFailover<T> create(List<T> publishers,
                                               Predicate<Throwable> failoverExeptionsPredicate,
                                               String noAvailablePublishersMsg,
                                               Duration retryGracePeriodMs) {
    return new ReactiveFailover<>(
        publishers.stream().map(p -> new PublisherHolder<>(() -> p, retryGracePeriodMs.toMillis())).toList(),
        failoverExeptionsPredicate,
        noAvailablePublishersMsg
    );
  }

  public static <T, A> ReactiveFailover<T> create(List<A> args,
                                                  Function<A, T> factory,
                                                  Predicate<Throwable> failoverExeptionsPredicate,
                                                  String noAvailablePublishersMsg,
                                                  Duration retryGracePeriodMs) {
    return new ReactiveFailover<>(
        args.stream().map(arg ->
            new PublisherHolder<>(() -> factory.apply(arg), retryGracePeriodMs.toMillis())).toList(),
        failoverExeptionsPredicate,
        noAvailablePublishersMsg
    );
  }

  private ReactiveFailover(List<PublisherHolder<T>> publishers,
                   Predicate<Throwable> failoverExceptionsPredicate,
                   String noAvailablePublishersMsg) {
    Preconditions.checkArgument(!publishers.isEmpty());
    this.publishers = publishers;
    this.failoverExceptionsPredicate = failoverExceptionsPredicate;
    this.noAvailablePublishersMsg = noAvailablePublishersMsg;
  }

  public <V> Mono<V> mono(Function<T, Mono<V>> f) {
    List<PublisherHolder<T>> candidates = getActivePublishers();
    if (candidates.isEmpty()) {
      return Mono.error(() -> new IllegalStateException(noAvailablePublishersMsg));
    }
    return mono(f, candidates);
  }

  private <V> Mono<V> mono(Function<T, Mono<V>> f, List<PublisherHolder<T>> candidates) {
    var publisher = candidates.get(0);
    return publisher.get()
        .flatMap(f)
        .onErrorResume(failoverExceptionsPredicate, th -> {
          publisher.markFailed();
          if (candidates.size() == 1) {
            return Mono.error(th);
          }
          var newCandidates = candidates.stream().skip(1).filter(PublisherHolder::isActive).toList();
          if (newCandidates.isEmpty()) {
            return Mono.error(th);
          }
          return mono(f, newCandidates);
        });
  }

  public <V> Flux<V> flux(Function<T, Flux<V>> f) {
    List<PublisherHolder<T>> candidates = getActivePublishers();
    if (candidates.isEmpty()) {
      return Flux.error(() -> new IllegalStateException(noAvailablePublishersMsg));
    }
    return flux(f, candidates);
  }

  private <V> Flux<V> flux(Function<T, Flux<V>> f, List<PublisherHolder<T>> candidates) {
    var publisher = candidates.get(0);
    return publisher.get()
        .flatMapMany(f)
        .onErrorResume(failoverExceptionsPredicate, th -> {
          publisher.markFailed();
          if (candidates.size() == 1) {
            return Flux.error(th);
          }
          var newCandidates = candidates.stream().skip(1).filter(PublisherHolder::isActive).toList();
          if (newCandidates.isEmpty()) {
            return Flux.error(th);
          }
          return flux(f, newCandidates);
        });
  }

  /**
   * Returns list of active publishers, starting with latest active.
   */
  private synchronized List<PublisherHolder<T>> getActivePublishers() {
    var result = new ArrayList<PublisherHolder<T>>();
    for (int i = 0, j = currentIndex; i < publishers.size(); i++) {
      var publisher = publishers.get(j);
      if (publisher.isActive()) {
        result.add(publisher);
      } else if (currentIndex == j) {
        currentIndex = ++currentIndex == publishers.size() ? 0 : currentIndex;
      }
      j = ++j == publishers.size() ? 0 : j;
    }
    return result;
  }

  static class PublisherHolder<T> {

    private final long retryGracePeriodMs;
    private final Supplier<T> supplier;
    private final AtomicLong lastErrorTs = new AtomicLong();
    private T publisherInstance;

    PublisherHolder(Supplier<T> supplier, long retryGracePeriodMs) {
      this.supplier = supplier;
      this.retryGracePeriodMs = retryGracePeriodMs;
    }

    synchronized Mono<T> get() {
      if (publisherInstance == null) {
        try {
          publisherInstance = supplier.get();
        } catch (Throwable th) {
          return Mono.error(th);
        }
      }
      return Mono.just(publisherInstance);
    }

    void markFailed() {
      lastErrorTs.set(System.currentTimeMillis());
    }

    boolean isActive() {
      return System.currentTimeMillis() - lastErrorTs.get() > retryGracePeriodMs;
    }
  }

}
