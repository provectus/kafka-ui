package com.provectus.kafka.ui.utilities.qase.enums;

public enum State {

  NOT_AUTOMATED(0),
  TO_BE_AUTOMATED(1),
  AUTOMATED(2);

  private final int value;

  State(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }
}
