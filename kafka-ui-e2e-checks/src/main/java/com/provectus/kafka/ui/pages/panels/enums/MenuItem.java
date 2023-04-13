package com.provectus.kafka.ui.pages.panels.enums;

public enum MenuItem {

  DASHBOARD("Dashboard", "Dashboard"),
  BROKERS("Brokers", "Brokers"),
  TOPICS("Topics", "Topics"),
  CONSUMERS("Consumers", "Consumers"),
  SCHEMA_REGISTRY("Schema Registry", "Schema Registry"),
  KAFKA_CONNECT("Kafka Connect", "Connectors"),
  KSQL_DB("KSQL DB", "KSQL DB");

  private final String naviTitle;
  private final String pageTitle;

  MenuItem(String naviTitle, String pageTitle) {
    this.naviTitle = naviTitle;
    this.pageTitle = pageTitle;
  }

  public String getNaviTitle() {
    return naviTitle;
  }

  public String getPageTitle() {
    return pageTitle;
  }
}
