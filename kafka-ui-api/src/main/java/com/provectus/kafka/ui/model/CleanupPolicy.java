package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import java.util.Arrays;

public enum CleanupPolicy {
  DELETE("delete"),
  COMPACT("compact"),
  COMPACT_DELETE("compact, delete"),
  UNKNOWN("unknown");

  private final String cleanUpPolicy;

  CleanupPolicy(String cleanUpPolicy) {
    this.cleanUpPolicy = cleanUpPolicy;
  }

  public String getCleanUpPolicy() {
    return cleanUpPolicy;
  }

  public static CleanupPolicy fromString(String string) {
    return Arrays.stream(CleanupPolicy.values())
        .filter(v -> v.cleanUpPolicy.equals(string))
        .findFirst()
        .orElseThrow(() ->
            new IllegalEntityStateException("Unknown cleanup policy value: " + string));
  }
}
