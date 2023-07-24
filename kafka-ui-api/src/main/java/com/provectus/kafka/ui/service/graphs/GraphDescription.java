package com.provectus.kafka.ui.service.graphs;

import java.time.Duration;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.Builder;

@Builder
public record GraphDescription(String id,
                               @Nullable Duration defaultInterval, //null for instant queries, set for range
                               String prometheusQuery,
                               Set<String> params) {

  public static GraphDescriptionBuilder instant() {
    return builder();
  }

  public static GraphDescriptionBuilder range(Duration defaultInterval) {
    return builder().defaultInterval(defaultInterval);
  }

  public boolean isRange() {
    return defaultInterval != null;
  }
}
