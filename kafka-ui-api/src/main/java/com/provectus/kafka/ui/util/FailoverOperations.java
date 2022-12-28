package com.provectus.kafka.ui.util;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class FailoverOperations<T> {

  public static final Duration DEFAULT_RETRY_GRACE_PERIOD_MS = Duration.ofSeconds(5);

  private final List<Publisher<T>> publishers;
  private int currentIndex = 0;

  private final Predicate<Throwable> failoverExeptionsPredicate;
  private final String noAvailablePublishersMsg;

  public static <T> FailoverOperations<T> create(List<T> publishers,
                                                 Predicate<Throwable> failoverExeptionsPredicate,
                                                 String noAvailablePublishersMsg,
                                                 Duration retryGracePeriodMs) {
    return new FailoverOperations<>(
        publishers.stream().map(p -> new Publisher<>(() -> p, retryGracePeriodMs.toMillis())).toList(),
        failoverExeptionsPredicate,
        noAvailablePublishersMsg
    );
  }

  public static <T, ARG> FailoverOperations<T> create(List<ARG> args,
                                                      Function<ARG, T> factory,
                                                      Predicate<Throwable> failoverExeptionsPredicate,
                                                      String noAvailablePublishersMsg,
                                                      Duration retryGracePeriodMs) {
    return new FailoverOperations<>(
        args.stream().map(arg -> new Publisher<>(() -> factory.apply(arg), retryGracePeriodMs.toMillis())).toList(),
        failoverExeptionsPredicate,
        noAvailablePublishersMsg
    );
  }

  @VisibleForTesting
  FailoverOperations(List<Publisher<T>> publishers,
                     Predicate<Throwable> failoverExeptionsPredicate,
                     String noAvailablePublishersMsg) {
    Preconditions.checkArgument(!publishers.isEmpty());
    this.publishers = publishers;
    this.failoverExeptionsPredicate = failoverExeptionsPredicate;
    this.noAvailablePublishersMsg = noAvailablePublishersMsg;
  }

  public <V> Mono<V> mono(Function<T, Mono<V>> f) {
    List<Publisher<T>> candidates = getActivePublishers();
    if (candidates.isEmpty()) {
      return Mono.error(() -> new IllegalStateException(noAvailablePublishersMsg));
    }
    return mono(f, candidates);
  }

  private <V> Mono<V> mono(Function<T, Mono<V>> f, List<Publisher<T>> candidates) {
    var publisher = candidates.get(0);
    return f.apply(publisher.get())
        .doOnError(failoverExeptionsPredicate, th -> publisher.markFailed())
        .onErrorResume(failoverExeptionsPredicate, th -> {
          if (candidates.size() == 1) {
            return Mono.error(th);
          }
          var newCandidates = candidates.stream().skip(1).filter(Publisher::isOk).toList();
          if (newCandidates.isEmpty()) {
            return Mono.error(th);
          }
          return mono(f, newCandidates);
        });
  }

  public <V> Flux<V> flux(Function<T, Flux<V>> f) {
    List<Publisher<T>> candidates = getActivePublishers();
    if (candidates.isEmpty()) {
      return Flux.error(() -> new IllegalStateException(noAvailablePublishersMsg));
    }
    return flux(f, candidates);
  }

  private <V> Flux<V> flux(Function<T, Flux<V>> f, List<Publisher<T>> candidates) {
    var publisher = candidates.get(0);
    return f.apply(publisher.get())
        .doOnError(failoverExeptionsPredicate, th -> publisher.markFailed())
        .onErrorResume(failoverExeptionsPredicate, th -> {
          if (candidates.size() == 1) {
            return Flux.error(th);
          }
          var newCandidates = candidates.stream().skip(1).filter(Publisher::isOk).toList();
          if (newCandidates.isEmpty()) {
            return Flux.error(th);
          }
          return flux(f, newCandidates);
        });
  }

  private synchronized List<Publisher<T>> getActivePublishers() {
    var result = new ArrayList<Publisher<T>>();
    for (int i = 0, j = currentIndex; i < publishers.size(); i++) {
      var publisher = publishers.get(j);
      if (publisher.isOk()) {
        result.add(publisher);
      } else if (currentIndex == j) {
        currentIndex = ++currentIndex == publishers.size() ? 0 : currentIndex;
      }
      j = ++j == publishers.size() ? 0 : j;
    }
    return result;
  }

  static class Publisher<T> {

    private final long retryGracePeriodMs;
    private final Supplier<T> supplier;
    private final AtomicLong lastErrorTs = new AtomicLong(0);
    private T publisherInstance;

    Publisher(Supplier<T> supplier, long retryGracePeriodMs) {
      this.supplier = supplier;
      this.retryGracePeriodMs = retryGracePeriodMs;
    }

    synchronized T get() {
      if (publisherInstance == null) {
        publisherInstance = supplier.get();
      }
      return publisherInstance;
    }

    void markFailed() {
      lastErrorTs.set(System.currentTimeMillis());
    }

    boolean isOk() {
      return System.currentTimeMillis() - lastErrorTs.get() > retryGracePeriodMs;
    }
  }

}
