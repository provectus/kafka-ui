package com.provectus.kafka.ui.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

@UtilityClass
@Slf4j
public class KafkaVersion {

  public static float parse(String version) throws NumberFormatException {
    log.trace("Parsing cluster version [{}]", version);
    try {
      final String[] parts = version.split("\\.");
      if (parts.length > 2) {
        version = parts[0] + "." + parts[1];
      }
      return Float.parseFloat(version.split("-")[0]);
    } catch (Exception e) {
      log.error("Conversion clusterVersion [{}] to float value failed", version, e);
      throw e;
    }
  }
}
