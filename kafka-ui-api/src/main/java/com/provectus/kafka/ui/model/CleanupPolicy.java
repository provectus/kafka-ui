package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.exception.IllegalEntityStateException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public enum CleanupPolicy {
  DELETE("delete"),
  COMPACT("compact"),
  COMPACT_DELETE(Arrays.asList("compact,delete", "delete,compact")),
  UNKNOWN("unknown");

  private final List<String> cleanUpPolicy;

  CleanupPolicy(String cleanUpPolicy) {
    this(Collections.singletonList(cleanUpPolicy));
  }

  CleanupPolicy(List<String> cleanUpPolicy) {
    this.cleanUpPolicy = cleanUpPolicy;
  }

  public String getCleanUpPolicy() {
    return cleanUpPolicy.get(0);
  }

  public static CleanupPolicy fromString(String string) {
    return Arrays.stream(CleanupPolicy.values())
        .filter(v ->
            v.cleanUpPolicy.stream().anyMatch(
                s -> s.equals(string.replace(" ", "")
                )
            )
        ).findFirst()
        .orElseThrow(() ->
            new IllegalEntityStateException("Unknown cleanup policy value: " + string));
  }
}
