package com.provectus.kafka.ui.pages.topic.enums;

public enum TimeToRetainDataButtons {
  BTN_12_HOURS("12 hours"),
  BTN_1_DAY("1 day"),
  BTN_2_DAYS("2 days"),
  BTN_7_DAYS("7 days"),
  BTN_4_WEEKS("4 weeks");

  final String value;

  TimeToRetainDataButtons(String value) {
    this.value = value;
  }

  public String getValue(){
    return value;
  }
}
