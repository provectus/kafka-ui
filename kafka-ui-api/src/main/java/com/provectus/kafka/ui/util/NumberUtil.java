package com.provectus.kafka.ui.util;

import org.apache.commons.lang3.math.NumberUtils;

public class NumberUtil {

  private NumberUtil() {
  }

  public static boolean isNumeric(Object value) {
    return value != null && NumberUtils.isCreatable(value.toString());
  }
}