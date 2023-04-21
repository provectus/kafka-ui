package com.provectus.kafka.ui.util;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.base.Preconditions;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class ReactiveFailoverTest {

  private static final String NO_AVAILABLE_PUBLISHERS_MSG = "no active publishers!";
  private static final Predicate<Throwable> FAILING_EXCEPTION_FILTER = th -> th.getMessage().contains("fail!");
  private static final Supplier<Throwable> FAILING_EXCEPTION_SUPPLIER = () -> new IllegalStateException("fail!");
  private static final Duration RETRY_PERIOD = Duration.ofMillis(300);

  private final List<Publisher> publishers = Stream.generate(Publisher::new).limit(3).toList();

  private final ReactiveFailover<Publisher> failover = ReactiveFailover.create(
      publishers,
      FAILING_EXCEPTION_FILTER,
      NO_AVAILABLE_PUBLISHERS_MSG,
      RETRY_PERIOD
  );

  @Test
  void testMonoFailoverCycle() throws InterruptedException {
    // starting with first publisher:
    // 0 -> ok : ok
    monoCheck(
        Map.of(
            0, okMono()
        ),
        List.of(0),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 0 -> fail, 1 -> ok : ok
    monoCheck(
        Map.of(
            0, failingMono(),
            1, okMono()
        ),
        List.of(0, 1),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 0.failed, 1.failed, 2 -> ok : ok
    monoCheck(
        Map.of(
            1, failingMono(),
            2, okMono()
        ),
        List.of(1, 2),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 0.failed, 1.failed, 2 -> fail : failing exception
    monoCheck(
        Map.of(
            2, failingMono()
        ),
        List.of(2),
        step -> step.verifyErrorMessage(FAILING_EXCEPTION_SUPPLIER.get().getMessage())
    );

    // 0.failed, 1.failed, 2.failed : No alive publisher exception
    monoCheck(
        Map.of(),
        List.of(),
        step -> step.verifyErrorMessage(NO_AVAILABLE_PUBLISHERS_MSG)
    );

    // resetting retry: all publishers became alive: 0.ok, 1.ok, 2.ok
    Thread.sleep(RETRY_PERIOD.toMillis() + 1);

    // starting with last errored publisher:
    // 2 -> fail, 0 -> fail, 1 -> ok : ok
    monoCheck(
        Map.of(
            2, failingMono(),
            0, failingMono(),
            1, okMono()
        ),
        List.of(2, 0, 1),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 1 -> ok : ok
    monoCheck(
        Map.of(
            1, okMono()
        ),
        List.of(1),
        step -> step.expectNextCount(1).verifyComplete()
    );
  }

  @Test
  void testFluxFailoverCycle() throws InterruptedException {
    // starting with first publisher:
    // 0 -> ok : ok
    fluxCheck(
        Map.of(
            0, okFlux()
        ),
        List.of(0),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 0 -> fail, 1 -> ok : ok
    fluxCheck(
        Map.of(
            0, failingFlux(),
            1, okFlux()
        ),
        List.of(0, 1),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 0.failed, 1.failed, 2 -> ok : ok
    fluxCheck(
        Map.of(
            1, failingFlux(),
            2, okFlux()
        ),
        List.of(1, 2),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 0.failed, 1.failed, 2 -> fail : failing exception
    fluxCheck(
        Map.of(
            2, failingFlux()
        ),
        List.of(2),
        step -> step.verifyErrorMessage(FAILING_EXCEPTION_SUPPLIER.get().getMessage())
    );

    // 0.failed, 1.failed, 2.failed : No alive publisher exception
    fluxCheck(
        Map.of(),
        List.of(),
        step -> step.verifyErrorMessage(NO_AVAILABLE_PUBLISHERS_MSG)
    );

    // resetting retry: all publishers became alive: 0.ok, 1.ok, 2.ok
    Thread.sleep(RETRY_PERIOD.toMillis() + 1);

    // starting with last errored publisher:
    // 2 -> fail, 0 -> fail, 1 -> ok : ok
    fluxCheck(
        Map.of(
            2, failingFlux(),
            0, failingFlux(),
            1, okFlux()
        ),
        List.of(2, 0, 1),
        step -> step.expectNextCount(1).verifyComplete()
    );

    // 1 -> ok : ok
    fluxCheck(
        Map.of(
            1, okFlux()
        ),
        List.of(1),
        step -> step.expectNextCount(1).verifyComplete()
    );
  }

  private void monoCheck(Map<Integer, Mono<String>> mock,
                         List<Integer> publishersToBeCalled, // for checking calls order
                         Consumer<StepVerifier.Step<?>> stepVerifier) {
    AtomicInteger calledCount = new AtomicInteger();
    var mono = failover.mono(publisher -> {
      int calledPublisherIdx = publishers.indexOf(publisher);
      assertThat(calledPublisherIdx).isEqualTo(publishersToBeCalled.get(calledCount.getAndIncrement()));
      return Preconditions.checkNotNull(
          mock.get(calledPublisherIdx),
          "Mono result not set for publisher %d", calledPublisherIdx
      );
    });
    stepVerifier.accept(StepVerifier.create(mono));
    assertThat(calledCount.get()).isEqualTo(publishersToBeCalled.size());
  }


  private void fluxCheck(Map<Integer, Flux<String>> mock,
                         List<Integer> publishersToBeCalled, // for checking calls order
                         Consumer<StepVerifier.Step<?>> stepVerifier) {
    AtomicInteger calledCount = new AtomicInteger();
    var flux = failover.flux(publisher -> {
      int calledPublisherIdx = publishers.indexOf(publisher);
      assertThat(calledPublisherIdx).isEqualTo(publishersToBeCalled.get(calledCount.getAndIncrement()));
      return Preconditions.checkNotNull(
          mock.get(calledPublisherIdx),
          "Mono result not set for publisher %d", calledPublisherIdx
      );
    });
    stepVerifier.accept(StepVerifier.create(flux));
    assertThat(calledCount.get()).isEqualTo(publishersToBeCalled.size());
  }

  private Flux<String> okFlux() {
    return Flux.just("ok");
  }

  private Flux<String> failingFlux() {
    return Flux.error(FAILING_EXCEPTION_SUPPLIER);
  }

  private Mono<String> okMono() {
    return Mono.just("ok");
  }

  private Mono<String> failingMono() {
    return Mono.error(FAILING_EXCEPTION_SUPPLIER);
  }

  public static class Publisher {
  }

}
