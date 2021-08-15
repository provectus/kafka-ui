package com.provectus.kafka.ui.exception;

public class InvalidStreamTopologyString extends RuntimeException {
  public InvalidStreamTopologyString() {
    super("Invalid stream topology string");
  }

  public InvalidStreamTopologyString(String message) {
    super(message);
  }
}
