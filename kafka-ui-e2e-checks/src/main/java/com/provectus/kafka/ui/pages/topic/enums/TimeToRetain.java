package com.provectus.kafka.ui.pages.topic.enums;

public enum TimeToRetain {
  BTN_12_HOURS("12 hours", "43200000"),
  BTN_1_DAY("1 day", "86400000"),
  BTN_2_DAYS("2 days", "172800000"),
  BTN_7_DAYS("7 days", "604800000"),
  BTN_4_WEEKS("4 weeks", "2419200000");

  private final String button;
  private final String value;

  TimeToRetain(String button, String value) {
    this.button = button;
    this.value = value;
  }

  public String getButton(){
    return button;
  }

  public String getValue(){
    return value;
  }
}
