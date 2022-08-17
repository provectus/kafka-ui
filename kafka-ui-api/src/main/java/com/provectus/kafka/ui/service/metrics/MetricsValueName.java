package com.provectus.kafka.ui.service.metrics;

public enum MetricsValueName {
  COUNT("Count"),
  ONE_MINUTE_RATE("OneMinuteRate"),
  FIFTEEN_MINUTE_RATE("FifteenMinuteRate"),
  FIVE_MINUTE_RATE("FiveMinuteRate"),
  MEAN_RATE("MeanRate");

  private final String value;

  MetricsValueName(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
