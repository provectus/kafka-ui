package com.provectus.kafka.ui.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;


class FailoverUrlListTest {

  public static final int RETRY_GRACE_PERIOD_IN_MS = 10;

  @Nested
  @SuppressWarnings("all")
  class ShouldHaveFailoverAvailableWhen {

    private FailoverUrlList failoverUrlList;

    @BeforeEach
    void before() {
      failoverUrlList = new FailoverUrlList(List.of("localhost:123", "farawayhost:5678"), RETRY_GRACE_PERIOD_IN_MS);
    }

    @Test
    void thereAreNoFailures() {
      assertThat(failoverUrlList.isFailoverAvailable()).isTrue();
    }

    @Test
    void withLessFailuresThenAvailableUrls() {
      failoverUrlList.fail(failoverUrlList.current());

      assertThat(failoverUrlList.isFailoverAvailable()).isTrue();
    }

    @Test
    void withAllFailuresAndAtLeastOneAfterTheGraceTimeoutPeriod() throws InterruptedException {
      failoverUrlList.fail(failoverUrlList.current());
      failoverUrlList.fail(failoverUrlList.current());

      Thread.sleep(RETRY_GRACE_PERIOD_IN_MS + 1);

      assertThat(failoverUrlList.isFailoverAvailable()).isTrue();
    }

    @Nested
    @SuppressWarnings("all")
    class ShouldNotHaveFailoverAvailableWhen {

      private FailoverUrlList failoverUrlList;

      @BeforeEach
      void before() {
        failoverUrlList = new FailoverUrlList(List.of("localhost:123", "farawayhost:5678"), 1000);
      }

      @Test
      void allFailuresWithinGracePeriod() {
        failoverUrlList.fail(failoverUrlList.current());
        failoverUrlList.fail(failoverUrlList.current());

        assertThat(failoverUrlList.isFailoverAvailable()).isFalse();
      }
    }
  }
}

