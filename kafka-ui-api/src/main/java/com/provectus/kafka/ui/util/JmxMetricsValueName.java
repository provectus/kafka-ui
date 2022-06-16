package com.provectus.kafka.ui.util;

public enum JmxMetricsValueName {
  COUNT("Count"),
  ONE_MINUTE_RATE("OneMinuteRate"),
  FIFTEEN_MINUTE_RATE("FifteenMinuteRate"),
  FIVE_MINUTE_RATE("FiveMinuteRate"),
  MEAN_RATE("MeanRate");

  private final String value;

  JmxMetricsValueName(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
