package com.provectus.kafka.ui.pages.ksqldb.enums;

public class KsqlMenuTabs {
  public enum KsqlMenu {
    TABLES("Table"),
    STREAMS("Streams");

    private final String value;

    KsqlMenu(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
  }
}
