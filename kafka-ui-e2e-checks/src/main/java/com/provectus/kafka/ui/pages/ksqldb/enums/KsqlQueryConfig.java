package com.provectus.kafka.ui.pages.ksqldb.enums;

public class KsqlQueryConfig {
  public enum KsqlRequests {
    SHOW_TABLES("show tables;"),
    SHOW_STREAMS("show streams;"),
    SELECT_ALL_FROM("SELECT * FROM %s\n" +
        "EMIT CHANGES;");

    private final String query;

    KsqlRequests(String query) {
      this.query = query;
    }

    public String getQuery(){
      return query;
    }
  }
}
