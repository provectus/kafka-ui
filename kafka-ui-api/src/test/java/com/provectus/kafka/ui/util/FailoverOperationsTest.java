package com.provectus.kafka.ui.util;

import static org.assertj.core.api.Assertions.assertThat;


import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class FailoverOperationsTest {

  private static final String NO_AVAILABLE_PUBLISHERS_MSG = "no active publishers!";
  private static final Predicate<Throwable> FAILING_EXCEPTION_FILTER = th -> th.getMessage().contains("fail!");
  private static final Supplier<Throwable> FAILING_EXCEPTION_SUPPLIER = () -> new IllegalStateException("fail!");
  private static final Duration RETRY_PERIOD = Duration.ofMillis(300);

  private final List<Publisher> publishers = Stream.generate(Publisher::new).limit(3).toList();

  private final FailoverOperations<Publisher> failover = FailoverOperations.create(
      publishers,
      FAILING_EXCEPTION_FILTER,
      NO_AVAILABLE_PUBLISHERS_MSG,
      RETRY_PERIOD
  );

  @Test
  void testFailoverCycle() {
    //
    exec(
        Map.of(
            0, okMono()
        ),
        List.of(0),
        step -> step.expectNextCount(1).verifyComplete()
    );

    exec(
        Map.of(
            0, failingMono(),
            1, okMono()
        ),
        List.of(0, 1),
        step -> step.expectNextCount(1).verifyComplete()
    );

    exec(
        Map.of(
            1, failingMono(),
            2, okMono()
        ),
        List.of(1, 2),
        step -> step.expectNextCount(1).verifyComplete()
    );

    exec(
        Map.of(
            2, failingMono()
        ),
        List.of(2),
        step -> step.verifyErrorMessage(FAILING_EXCEPTION_SUPPLIER.get().getMessage())
    );

    exec(
        Map.of(),
        List.of(),
        step -> step.verifyErrorMessage(NO_AVAILABLE_PUBLISHERS_MSG)
    );
  }

  private void exec(Map<Integer, Mono<String>> mock,
                    List<Integer> publishersToBeCalled,
                    Consumer<StepVerifier.Step<?>> stepVerifier) {
    AtomicInteger calledCount = new AtomicInteger();
    var mono = failover.mono(p -> {
      int calledPublisherIdx = publishers.indexOf(p);
      assertThat(calledPublisherIdx).isEqualTo(publishersToBeCalled.get(calledCount.getAndIncrement()));
      return mock.get(calledPublisherIdx);
    });
    stepVerifier.accept(StepVerifier.create(mono));
    assertThat(calledCount.get()).isEqualTo(publishersToBeCalled.size());
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
