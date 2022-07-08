package com.provectus.kafka.ui.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public enum CleanupPolicy {
  DELETE("delete"),
  COMPACT("compact"),
  COMPACT_DELETE(Arrays.asList("compact,delete", "delete,compact")),
  UNKNOWN("unknown");

  private final List<String> policies;

  CleanupPolicy(String policy) {
    this(Collections.singletonList(policy));
  }

  CleanupPolicy(List<String> policies) {
    this.policies = policies;
  }

  public String getPolicy() {
    return policies.get(0);
  }

  public static CleanupPolicy fromString(String string) {
    return Arrays.stream(CleanupPolicy.values())
        .filter(v ->
            v.policies.stream().anyMatch(
                s -> s.equals(string.replace(" ", "")
                )
            )
        ).findFirst()
        .orElse(UNKNOWN);
  }
}
