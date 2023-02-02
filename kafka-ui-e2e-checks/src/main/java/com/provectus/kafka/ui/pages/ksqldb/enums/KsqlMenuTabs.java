package com.provectus.kafka.ui.pages.ksqldb.enums;

public enum KsqlMenuTabs {
    TABLES("Table"),
    STREAMS("Streams");

    private final String value;

    KsqlMenuTabs(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
}
