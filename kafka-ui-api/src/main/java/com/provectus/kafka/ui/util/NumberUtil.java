package com.provectus.kafka.ui.util;

import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.math.NumberUtils;

@Log4j2
public class NumberUtil {

  private NumberUtil() {
  }

  public static boolean isNumeric(Object value) {
    return value != null && NumberUtils.isCreatable(value.toString());
  }

  public static float parserClusterVersion(String version) {
    try {
      final String[] parts = version.split("\\.");
      if (parts.length > 2) {
        version = parts[0] + "." + parts[1];
      }
      return Float.parseFloat(version.split("-")[0]);
    } catch (Exception e) {
      log.error("Conversion clusterVersion {} to float value failed", version);
      throw e;
    }
  }
}