package com.provectus.kafka.ui.utilities.qase.enums;

public enum Status {

  ACTUAL(0),
  DRAFT(1),
  DEPRECATED(2);

  private final int value;

  Status(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }
}
