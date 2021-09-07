package com.provectus.kafka.ui.util;

import java.util.Map;
import java.util.stream.Collectors;

public class MapUtil {

  private MapUtil() {
  }

  public static <K, V> Map<K, V> removeNullValues(Map<K, V> map) {
    return map.entrySet().stream()
        .filter(e -> e.getValue() != null)
        .collect(
            Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue
            )
        );
  }
}
